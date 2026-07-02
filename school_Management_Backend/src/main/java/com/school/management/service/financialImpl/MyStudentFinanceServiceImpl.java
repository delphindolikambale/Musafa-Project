package com.school.management.service.financialImpl;

import com.school.management.dto.financial.MyFinancialStatusDTO;
import com.school.management.dto.financial.MyInstallmentStatusDTO;
import com.school.management.dto.financial.MyPaymentTransactionDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Student;
import com.school.management.model.auth.User;
import com.school.management.model.financial.StudentAnnualFinancialProfile;
import com.school.management.model.financial.StudentFinancialAccount;
import com.school.management.model.financial.StudentPayment;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.repository.financial.StudentFinancialAccountRepository;
import com.school.management.repository.financial.StudentPaymentRepository;
import com.school.management.repository.financial.InstallmentSchedulePaymentRepository;
import com.school.management.service.financial.MyStudentFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyStudentFinanceServiceImpl implements MyStudentFinanceService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentFinancialAccountRepository accountRepository;
    private final StudentPaymentRepository paymentRepository;
    private final InstallmentSchedulePaymentRepository installmentSchedulePaymentRepository;

    @Override
    @Transactional(readOnly = true)
    public MyFinancialStatusDTO getMyCurrentFinancialStatus(String username) {

        // 1. Récupérer l'utilisateur (User) via le username contenu dans le token JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec ce pseudo : " + username));

        Long currentSchoolId = user.getSchool().getId();

        // 2. Récupérer l'étudiant lié à cet ID utilisateur en sécurisant par son école (Multi-tenant)
        Student student = studentRepository.findByUserIdAndSchoolId(user.getId(), currentSchoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun profil étudiant n'est lié à cet utilisateur pour cet établissement"));

        // 3. ✅ CORRECTION MULTI-TENANT : Utilisation de la méthode filtrée par établissement
        StudentFinancialAccount account = accountRepository.findByStudentIdAndSchoolId(student.getId(), currentSchoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun compte financier associé à cet élève"));

        // 4. ✅ CORRECTION MULTI-TENANT : Utilisation de findWithProfilesByAccountNumberAndSchoolId
        StudentAnnualFinancialProfile activeProfile = accountRepository.findWithProfilesByAccountNumberAndSchoolId(account.getAccountNumber(), currentSchoolId)
                .map(acc -> acc.getAnnualProfiles().stream()
                        .filter(p -> p.isActive() && p.getAcademicYear() != null
                                && p.getAcademicYear().getSchool() != null
                                && p.getAcademicYear().getSchool().getId().equals(currentSchoolId))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Aucun profil financier actif trouvé pour votre établissement")))
                .orElseThrow(() -> new ResourceNotFoundException("Erreur lors de la lecture du profil financier"));

        // 5. ✅ CORRECTION : Utilisation de la méthode sécurisée par établissement (Multi-Tenant)
        List<StudentPayment> payments = paymentRepository.findByAnnualProfileIdAndSchoolId(activeProfile.getId(), currentSchoolId);

        // 6. Mapper les paiements en DTOs
        List<MyPaymentTransactionDTO> transactionDTOs = payments.stream().map(payment -> {

            boolean hasScolarite = payment.getBreakdowns().stream()
                    .anyMatch(b -> "SCOLARITE".equalsIgnoreCase(b.getFeesGroupName()));

            String motif = hasScolarite ? "Frais Scolaires" :
                    (!payment.getBreakdowns().isEmpty() ? "Frais divers (" + payment.getBreakdowns().get(0).getFeesItemName() + ")" : "Paiement");

            return MyPaymentTransactionDTO.builder()
                    .paymentId(payment.getId())
                    .receiptNumber(payment.getReceiptNumber())
                    .amountPaid(payment.getAmountPaid())
                    .currency(payment.getCurrency().toString())
                    .paymentDate(payment.getPaymentDate())
                    .paymentMethod(payment.getPaymentMethod())
                    .mainPurpose(motif)
                    .build();
        }).collect(Collectors.toList());

        // 7. CALCUL ET MAPPING DE L'ÉVOLUTION DE CHAQUE TRANCHE
        List<MyInstallmentStatusDTO> installmentDTOs = activeProfile.getScheduleFees().getInstallments().stream()
                .sorted((a, b) -> a.getInstallmentNumber().compareTo(b.getInstallmentNumber()))
                .map(installment -> {
                    // ✅ CORRECTION : Appel de la fonction d'agrégation sécurisée avec currentSchoolId
                    BigDecimal amountPaidForThisInstallment = installmentSchedulePaymentRepository
                            .sumAmountAppliedByInstallmentAndProfileAndSchoolId(installment.getId(), activeProfile.getId(), currentSchoolId);

                    BigDecimal remaining = installment.getAmount().subtract(amountPaidForThisInstallment);
                    if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                        remaining = BigDecimal.ZERO;
                    }

                    boolean isFullyPaid = remaining.compareTo(BigDecimal.ZERO) == 0;

                    return MyInstallmentStatusDTO.builder()
                            .installmentId(installment.getId())
                            .installmentNumber(installment.getInstallmentNumber())
                            .amountRequired(installment.getAmount())
                            .amountPaid(amountPaidForThisInstallment)
                            .remainingAmount(remaining)
                            .startDate(installment.getStartDate())
                            .dueDate(installment.getDueDate())
                            .fullyPaid(isFullyPaid)
                            .build();
                }).collect(Collectors.toList());

        // 8. Construire et retourner le DTO final global enrichi
        return MyFinancialStatusDTO.builder()
                .accountNumber(account.getAccountNumber())
                .academicYear(activeProfile.getAcademicYear().getAnnee())
                .className(activeProfile.getEnrollment().getClassroom().getDisplayName())
                .totalAmountDue(activeProfile.getTotalAmountDue())
                .totalAmountPaid(activeProfile.getTotalAmountPaid())
                .balance(activeProfile.getBalance())
                .currency(activeProfile.getCurrency().toString())
                .installments(installmentDTOs)
                .paymentHistory(transactionDTOs)
                .build();
    }
}