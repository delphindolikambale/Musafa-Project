package com.school.management.service.financialImpl;

import com.school.management.dto.financial.*;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Enrollment;
import com.school.management.model.financial.*;
import com.school.management.repository.academic.EnrollmentRepository;
import com.school.management.repository.financial.*;
import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional // Sécurise les transactions

public class StudentAnnualFinancialProfileServiceImpl implements StudentAnnualFinancialProfileService {

    private final StudentFinancialAccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ScheduleFeesRepository scheduleFeesRepository;
    private final StudentAnnualFinancialProfileRepository repository;
    private final FeesGroupRepository feesGroupRepository;
    private final StudentPaymentBreakdownRepository breakdownRepository;

    @Override
    public StudentAnnualFinancialProfileResponseDTO create(StudentAnnualFinancialProfileCreateDTO dto) {
        StudentFinancialAccount account = accountRepository.findById(dto.getFinancialAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Compte financier introuvable"));

        Enrollment enrollment = enrollmentRepository.findById(dto.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable"));

        ScheduleFees scheduleFees = scheduleFeesRepository.findById(dto.getScheduleFeesId())
                .orElseThrow(() -> new ResourceNotFoundException("Barème introuvable"));

        repository.findByFinancialAccountIdAndAcademicYearId(account.getId(), enrollment.getAcademicYear().getId())
                .ifPresent(p -> { throw new IllegalStateException("Profil financier déjà existant pour cette année."); });

        StudentAnnualFinancialProfile profile = StudentAnnualFinancialProfile.builder()
                .financialAccount(account)
                .enrollment(enrollment)
                .academicYear(enrollment.getAcademicYear())
                .scheduleFees(scheduleFees)
                .totalAmountPaid(BigDecimal.ZERO)
                .active(true)
                .build();

        return mapToResponseDTO(repository.save(profile));
    }

    @Override @Transactional(readOnly = true)
    public StudentAnnualFinancialProfileResponseDTO getById(Long id) {
        return repository.findById(id).map(this::mapToResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Profil introuvable"));
    }

    @Override @Transactional(readOnly = true)
    public List<StudentAnnualFinancialProfileResponseDTO> getAll() {
        return repository.findAll().stream().map(this::mapToResponseDTO).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<StudentAnnualFinancialProfileResponseDTO> getByAccountNumber(String accountNumber) {
        return repository.findByFinancialAccount_AccountNumber(accountNumber).stream()
                .map(this::mapToResponseDTO).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<StudentAnnualFinancialProfileResponseDTO> getByClassroom(Long classroomId) {
        return repository.findByEnrollment_Classroom_Id(classroomId).stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private StudentAnnualFinancialProfileResponseDTO mapToResponseDTO(StudentAnnualFinancialProfile profile) {
        BigDecimal totalDue = profile.getTotalAmountDue() != null ? profile.getTotalAmountDue() : BigDecimal.ZERO;
        BigDecimal totalPaidGlobal = profile.getTotalAmountPaid() != null ? profile.getTotalAmountPaid() : BigDecimal.ZERO;

        List<FeesGroup> configGroups = feesGroupRepository.findByAcademicYearIdAndActiveTrue(profile.getAcademicYear().getId());

        List<FeesGroupResponseDTO> feeBreakdownDTOs = configGroups.stream().map(group -> {
            BigDecimal groupTotalAmount = totalDue.multiply(group.getPercentage()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal groupPaid = totalPaidGlobal.multiply(group.getPercentage()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            return FeesGroupResponseDTO.builder()
                    .id(group.getId())
                    .academicYearId(group.getAcademicYear().getId())
                    .type(group.getType())
                    .percentage(group.getPercentage())
                    .calculatedAmount(groupTotalAmount)
                    .paidAmount(groupPaid)
                    .active(group.isActive())
                    .feesItems(group.getFeesItems().stream().map(item -> {
                        BigDecimal itemTotalAmount = BigDecimal.ZERO;
                        if (group.getPercentage().compareTo(BigDecimal.ZERO) > 0) {
                            itemTotalAmount = groupTotalAmount.multiply(item.getPercentage())
                                    .divide(group.getPercentage(), 2, RoundingMode.HALF_UP);
                        }

                        BigDecimal itemPaid = BigDecimal.ZERO;
                        if (group.getPercentage().compareTo(BigDecimal.ZERO) > 0) {
                            itemPaid = groupPaid.multiply(item.getPercentage())
                                    .divide(group.getPercentage(), 2, RoundingMode.HALF_UP);
                        }

                        return FeesItemResponseDTO.builder()
                                .id(item.getId())
                                .academicYearId(item.getAcademicYear().getId())
                                .feesGroupId(group.getId())
                                .feesGroupType(group.getType().name())
                                .nameFeesItem(item.getNameFeesItem())
                                .percentage(item.getPercentage())
                                .calculatedAmount(itemTotalAmount)
                                .paidAmount(itemPaid)
                                .active(item.isActive())
                                .build();
                    }).toList())
                    .build();
        }).toList();

        List<InstallmentScheduleResponseDTO> installmentDTOs = new ArrayList<>();
        if (profile.getScheduleFees() != null && profile.getScheduleFees().getInstallments() != null) {
            BigDecimal remainingToDistribute = profile.getTotalAmountPaid();
            List<InstallmentSchedule> sorted = profile.getScheduleFees().getInstallments().stream()
                    .sorted(Comparator.comparing(InstallmentSchedule::getInstallmentNumber)).toList();

            for (InstallmentSchedule inst : sorted) {
                BigDecimal paidForThis = remainingToDistribute.min(inst.getAmount());
                remainingToDistribute = remainingToDistribute.subtract(paidForThis);

                installmentDTOs.add(InstallmentScheduleResponseDTO.builder()
                        .id(inst.getId())
                        .installmentNumber(inst.getInstallmentNumber())
                        .amount(inst.getAmount())
                        .amountPaid(paidForThis)
                        .startDate(inst.getStartDate())
                        .dueDate(inst.getDueDate())
                        .paid(paidForThis.compareTo(inst.getAmount()) >= 0)
                        .status(paidForThis.compareTo(inst.getAmount()) >= 0 ? "PAYÉ" : (paidForThis.compareTo(BigDecimal.ZERO) > 0 ? "PARTIEL" : "ATTENTE"))
                        .build());
            }
        }

        return StudentAnnualFinancialProfileResponseDTO.builder()
                .id(profile.getId())
                .studentFullName(profile.getFinancialAccount().getStudent().getFullName())
                .permanentNumber(profile.getFinancialAccount().getAccountNumber())
                .academicYear(profile.getAcademicYear().getName())
                .classroom(profile.getEnrollment().getClassroom().getDisplayName())
                .scheduleFeesId(profile.getScheduleFees().getId())
                .scheduleFeesName(profile.getScheduleFees().getLevel().getName())
                .totalAmountDue(totalDue)
                .totalAmountPaid(profile.getTotalAmountPaid())
                .balance(profile.getBalance())
                .currency(profile.getCurrency().name())
                .installments(installmentDTOs)
                .feeBreakdown(feeBreakdownDTOs)
                .active(profile.isActive())
                .build();
    }
}
