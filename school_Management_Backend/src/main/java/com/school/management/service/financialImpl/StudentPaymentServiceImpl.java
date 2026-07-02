package com.school.management.service.financialImpl;

import com.school.management.dto.financial.*;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import com.school.management.model.financial.*;
import com.school.management.repository.financial.*;
import com.school.management.service.financial.DetailsCashTransactionService;
import com.school.management.service.financial.StudentPaymentService;
import com.school.management.service.financial.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentPaymentServiceImpl implements StudentPaymentService {

    private final StudentPaymentRepository paymentRepository;
    private final StudentAnnualFinancialProfileRepository profileRepository;
    private final InstallmentScheduleRepository installmentScheduleRepository;
    private final InstallmentSchedulePaymentRepository installmentSchedulePaymentRepository;
    private final FeesGroupRepository feesGroupRepository;
    private final FeesItemRepository feesItemRepository;
    private final StudentPaymentBreakdownRepository breakdownRepository;
    private final StudentFinancialAccountRepository accountRepository;
    private final TransactionHistoryService transactionHistoryService;
    private final DetailsCashTransactionService detailsService;

    @Override
    @Transactional(readOnly = true)
    public DailyCashierReportDTO getDailyReport(Long schoolId) {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);

        List<StudentPayment> dailyPayments = paymentRepository.findByPaymentDateBetweenAndSchoolId(start, end, schoolId);

        BigDecimal totalCdf = dailyPayments.stream()
                .filter(p -> p.getCurrency() == Currency.CDF)
                .map(StudentPayment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUsd = dailyPayments.stream()
                .filter(p -> p.getCurrency() == Currency.USD)
                .map(StudentPayment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal scolCdf = breakdownRepository.sumByGroupNameAndCurrencyAndDateAndSchoolId("SCOLARITE", Currency.CDF, start, end, schoolId);
        BigDecimal scolUsd = breakdownRepository.sumByGroupNameAndCurrencyAndDateAndSchoolId("SCOLARITE", Currency.USD, start, end, schoolId);

        BigDecimal divCdf = breakdownRepository.sumByGroupNameAndCurrencyAndDateAndSchoolId("DIVERS", Currency.CDF, start, end, schoolId);
        BigDecimal divUsd = breakdownRepository.sumByGroupNameAndCurrencyAndDateAndSchoolId("DIVERS", Currency.USD, start, end, schoolId);

        return DailyCashierReportDTO.builder()
                .totalCollectedCdf(totalCdf)
                .totalCollectedUsd(totalUsd)
                .transactionCount((long) dailyPayments.size())
                .scolariteCdf(scolCdf != null ? scolCdf : BigDecimal.ZERO)
                .scolariteUsd(scolUsd != null ? scolUsd : BigDecimal.ZERO)
                .diversCdf(divCdf != null ? divCdf : BigDecimal.ZERO)
                .diversUsd(divUsd != null ? divUsd : BigDecimal.ZERO)
                .build();
    }

    @Override
    public StudentPaymentResponseDTO pay(StudentPaymentCreateDTO dto, Long schoolId) {
        StudentAnnualFinancialProfile targetProfile = profileRepository.findById(dto.getAnnualProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil financier introuvable"));

        // Blocage de sécurité anti-cross-tenant
        if (!targetProfile.getAcademicYear().getSchool().getId().equals(schoolId)) {
            throw new SecurityException("Opération interdite : Ce profil n'appartient pas à votre école.");
        }

        StudentFinancialAccount account = targetProfile.getFinancialAccount();

        // MULTI-TENANT OPTIMISÉ
        List<StudentAnnualFinancialProfile> unpaidProfiles = profileRepository
                .findByFinancialAccount_AccountNumberAndSchoolId(account.getAccountNumber(), schoolId)
                .stream()
                .filter(p -> p.isActive() && p.getBalance().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(p -> p.getAcademicYear().getAnnee()))
                .toList();

        BigDecimal remainingAmount = dto.getAmountPaid();
        StudentPayment lastPaymentCreated = null;

        String yearStr = targetProfile.getAcademicYear().getAnnee().substring(2, 4);
        String monthStr = String.format("%02d", LocalDateTime.now().getMonthValue());
        String searchPrefix = "PAY-" + yearStr + "-" + monthStr + "-N";

        // Isolation du compteur de reçus par école
        long currentCount = paymentRepository.countByReceiptNumberStartingWithAndSchoolId(searchPrefix, schoolId);

        for (StudentAnnualFinancialProfile profile : unpaidProfiles) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal debtOnThisProfile = profile.getBalance();
            BigDecimal amountToApply = remainingAmount.min(debtOnThisProfile);

            currentCount++;
            String finalReceiptNumber = searchPrefix + String.format("%02d", currentCount);

            StudentPayment payment = StudentPayment.builder()
                    .receiptNumber(finalReceiptNumber)
                    .annualProfile(profile)
                    .amountPaid(amountToApply)
                    .currency(profile.getCurrency())
                    .paymentMethod(dto.getPaymentMethod())
                    .paymentDate(LocalDateTime.now())
                    .collectedBy("SYSTEM_CASHIER")
                    .school(targetProfile.getAcademicYear().getSchool()) // Assignation explicite du tenant
                    .build();

            lastPaymentCreated = paymentRepository.save(payment);

            // CORRECTION DU COMPTEUR D'ARGUMENTS : Ajout du paramètre schoolId en 8ème position
            transactionHistoryService.logTransaction(
                    "IN",
                    "Paiement Frais Scolaires - " + account.getStudent().getFullName(),
                    amountToApply,
                    payment.getCurrency().name(),
                    finalReceiptNumber,
                    "SYSTEM_CASHIER",
                    lastPaymentCreated.getId(),
                    schoolId
            );

            // ADAPTATION MULTI-TENANT : Transmission du schoolId pour la ventilation des tranches
            applyPaymentToInstallments(lastPaymentCreated, amountToApply, profile.getId(), schoolId);

            // CORRECTION : Transmission du schoolId pour la ventilation par groupe de frais
            calculateAndSaveBreakdown(lastPaymentCreated, amountToApply, schoolId);

            profile.setTotalAmountPaid(profile.getTotalAmountPaid().add(amountToApply));
            profileRepository.save(profile);

            remainingAmount = remainingAmount.subtract(amountToApply);
        }

        return mapToDTO(lastPaymentCreated != null ? lastPaymentCreated : new StudentPayment());
    }

    // CORRECTION MULTI-TENANT : Ajout du schoolId dans la signature de la méthode de répartition
    private void calculateAndSaveBreakdown(StudentPayment payment, BigDecimal totalPaid, Long schoolId) {
        List<FeesGroup> groups = feesGroupRepository.findByAcademicYearIdAndSchoolIdAndActiveTrue(
                payment.getAnnualProfile().getAcademicYear().getId(), schoolId
        );

        if (groups.isEmpty()) return;

        BigDecimal totalDistributedToGroups = BigDecimal.ZERO;
        Currency currency = payment.getCurrency();

        for (int i = 0; i < groups.size(); i++) {
            FeesGroup group = groups.get(i);
            BigDecimal groupPercentage = group.getPercentage();

            BigDecimal groupAmount = (i == groups.size() - 1)
                    ? totalPaid.subtract(totalDistributedToGroups)
                    : totalPaid.multiply(groupPercentage).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            totalDistributedToGroups = totalDistributedToGroups.add(groupAmount);

            if (groupAmount.compareTo(BigDecimal.ZERO) <= 0) continue;

            List<FeesItem> items = group.getFeesItems();
            if (items.isEmpty()) continue;

            BigDecimal distributedToItems = BigDecimal.ZERO;

            for (int j = 0; j < items.size(); j++) {
                FeesItem item = items.get(j);
                BigDecimal itemAmount = BigDecimal.ZERO;

                if (j == items.size() - 1) {
                    itemAmount = groupAmount.subtract(distributedToItems);
                } else if (groupPercentage.compareTo(BigDecimal.ZERO) > 0) {
                    itemAmount = groupAmount.multiply(item.getPercentage())
                            .divide(groupPercentage, 2, RoundingMode.HALF_UP);
                }

                distributedToItems = distributedToItems.add(itemAmount);

                if (currency == Currency.USD) {
                    item.setBalanceUSD(item.getBalanceUSD().add(itemAmount));
                    group.setBalanceUSD(group.getBalanceUSD().add(itemAmount));
                } else {
                    item.setBalanceCDF(item.getBalanceCDF().add(itemAmount));
                    group.setBalanceCDF(group.getBalanceCDF().add(itemAmount));
                }

                feesItemRepository.save(item);

                breakdownRepository.save(StudentPaymentBreakdown.builder()
                        .payment(payment)
                        .feesGroup(group)
                        .feesGroupName(group.getType().name())
                        .feesItem(item)
                        .feesItemName(item.getNameFeesItem())
                        .amount(itemAmount)
                        .currency(payment.getCurrency())
                        .appliedPercentage(item.getPercentage())
                        .build());
            }
            feesGroupRepository.save(group);
        }

        var profile = payment.getAnnualProfile();
        String studentInfo = profile.getFinancialAccount().getStudent().getFullName() + " (" + profile.getEnrollment().getClassroom().getDisplayName() + ")";
        String currentMonth = LocalDateTime.now().getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH).toUpperCase();

        detailsService.record(DetailsCashTransactionCreateDTO.builder()
                .academicYear(profile.getAcademicYear().getAnnee())
                .month(currentMonth)
                .type(TransactionType.ENTREE)
                .description("Paiement Frais Scolaires")
                .currency(payment.getCurrency())
                .amount(totalPaid)
                .actor(studentInfo)
                .documentNumber(payment.getReceiptNumber())
                .build(), schoolId);
    }

    private void applyPaymentToInstallments(StudentPayment payment, BigDecimal amountToApply, Long profileId, Long schoolId) {
        BigDecimal remaining = amountToApply;

        List<InstallmentSchedule> schedule = installmentScheduleRepository
                .findByScheduleFeesIdAndSchoolIdOrderByInstallmentNumberAsc(payment.getAnnualProfile().getScheduleFees().getId(), schoolId);

        for (InstallmentSchedule installment : schedule) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal alreadyPaid = installmentSchedulePaymentRepository
                    .sumAmountAppliedByInstallmentAndProfileAndSchoolId(installment.getId(), profileId, schoolId);
            if (alreadyPaid == null) alreadyPaid = BigDecimal.ZERO;

            BigDecimal rest = installment.getAmount().subtract(alreadyPaid);
            if (rest.compareTo(BigDecimal.ZERO) <= 0) {
                if (!installment.getPaid()) {
                    installment.setPaid(true);
                    installmentScheduleRepository.save(installment);
                }
                continue;
            }

            BigDecimal amountForInst = remaining.min(rest);
            boolean isNowFullyPaid = alreadyPaid.add(amountForInst).compareTo(installment.getAmount()) >= 0;

            // ✅ CORRECTION MULTI-TENANT : Assignation de l'école récupérée du paiement parent
            InstallmentSchedulePayment isp = InstallmentSchedulePayment.builder()
                    .installmentSchedule(installment)
                    .installmentNumber(installment.getInstallmentNumber())
                    .studentPayment(payment)
                    .amountApplied(amountForInst)
                    .fullyPaid(isNowFullyPaid)
                    .appliedAt(LocalDateTime.now())
                    .school(payment.getSchool())
                    .build();

            installmentSchedulePaymentRepository.save(isp);

            if (isNowFullyPaid) {
                installment.setPaid(true);
                installmentScheduleRepository.save(installment);
            }

            remaining = remaining.subtract(amountForInst);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StudentFinancialSummaryDTO getAccountSummary(String identifier, Long schoolId) {
        StudentFinancialAccount account = accountRepository.findByAccountNumberAndSchoolId(identifier, schoolId)
                .orElseGet(() -> accountRepository.findByStudent_MatriculeAndSchoolId(identifier, schoolId)
                        .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable")));

        List<StudentAnnualFinancialProfile> profiles = profileRepository.findByFinancialAccount_AccountNumberAndSchoolId(account.getAccountNumber(), schoolId);

        if (profiles.isEmpty()) {
            throw new ResourceNotFoundException("Aucun profil financier pour cette école.");
        }

        BigDecimal totalBalance = profiles.stream()
                .map(StudentAnnualFinancialProfile::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal oldDebt = profiles.stream()
                .sorted(Comparator.comparing((StudentAnnualFinancialProfile p) -> p.getAcademicYear().getAnnee()).reversed())
                .skip(1)
                .map(StudentAnnualFinancialProfile::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String currentClass = profiles.stream()
                .max(Comparator.comparing(p -> p.getAcademicYear().getAnnee()))
                .map(p -> p.getEnrollment().getClassroom().getDisplayName())
                .orElse("N/A");

        Long latestProfileId = profiles.stream()
                .max(Comparator.comparing(p -> p.getAcademicYear().getAnnee()))
                .map(StudentAnnualFinancialProfile::getId)
                .orElse(null);

        return StudentFinancialSummaryDTO.builder()
                .accountNumber(account.getAccountNumber())
                .studentFullName(account.getStudent().getFullName())
                .currentClassroom(currentClass)
                .totalBalance(totalBalance)
                .previousYearsDebt(oldDebt)
                .hasDebt(oldDebt.compareTo(BigDecimal.ZERO) > 0)
                .currency(profiles.get(0).getCurrency().name())
                .annualProfileId(latestProfileId)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentPaymentResponseDTO> getAll(Long schoolId) {
        return paymentRepository.findAllBySchoolId(schoolId).stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentPaymentResponseDTO getById(Long id, Long schoolId) {
        StudentPayment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));

        if (!payment.getSchool().getId().equals(schoolId)) {
            throw new SecurityException("Accès refusé à ce reçu de paiement.");
        }
        return mapToDTO(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentPaymentResponseDTO getByReceiptNumber(String receiptNumber, Long schoolId) {
        return paymentRepository.findByReceiptNumberAndSchoolId(receiptNumber, schoolId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Reçu introuvable"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentPaymentResponseDTO> getByAnnualProfile(Long annualProfileId, Long schoolId) {
        return paymentRepository.findByAnnualProfileIdAndSchoolId(annualProfileId, schoolId).stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByAccountNumber(String accountNumber, Long schoolId) {
        var accountOpt = accountRepository.findByAccountNumberAndSchoolId(accountNumber, schoolId)
                .or(() -> accountRepository.findByStudent_MatriculeAndSchoolId(accountNumber, schoolId));

        return accountOpt.isPresent() && accountOpt.get().getStudent().getSchool().getId().equals(schoolId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentPaymentResponseDTO> getByAccountNumber(String accountNumber, Long schoolId) {
        return paymentRepository.findAllBySchoolId(schoolId).stream()
                .filter(p -> p.getAnnualProfile().getFinancialAccount().getAccountNumber().equals(accountNumber))
                .map(this::mapToDTO).toList();
    }

    private StudentPaymentResponseDTO mapToDTO(StudentPayment payment) {
        if (payment == null || payment.getAnnualProfile() == null) return null;
        return StudentPaymentResponseDTO.builder()
                .id(payment.getId())
                .receiptNumber(payment.getReceiptNumber())
                .annualProfileId(payment.getAnnualProfile().getId())
                .accountNumber(payment.getAnnualProfile().getFinancialAccount().getAccountNumber())
                .studentFullName(payment.getAnnualProfile().getFinancialAccount().getStudent().getFullName())
                .amountPaid(payment.getAmountPaid())
                .balanceAfterPayment(payment.getAnnualProfile().getBalance())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .paymentDate(payment.getPaymentDate())
                .collectedBy(payment.getCollectedBy())
                .build();
    }
}