package com.school.management.service.financialImpl;

import com.school.management.dto.financial.*;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.enums.PaymentFrequency;
import com.school.management.model.financial.*;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.LevelRepository;
import com.school.management.repository.academic.OptionRepository;
import com.school.management.repository.financial.ScheduleFeesRepository;
import com.school.management.repository.financial.StudentAnnualFinancialProfileRepository;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.financial.InstallmentScheduleService;
import com.school.management.service.financial.ScheduleFeesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleFeesServiceImpl implements ScheduleFeesService {

    private final ScheduleFeesRepository repository;
    private final AcademicYearRepository academicYearRepository;
    private final LevelRepository levelRepository;
    private final OptionRepository optionRepository;
    private final InstallmentScheduleService installmentScheduleService;
    private final StudentAnnualFinancialProfileRepository profileRepository;
    private final NotificationService notificationService;

    /**
     * Extrait l'ID de l'établissement lié à la session utilisateur courante
     */
    private Long getCurrentSchoolId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        boolean isSuperAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SUPER_ADMIN_SYSTEM") || a.getAuthority().equals("ROLE_SUPER_ADMIN_SYSTEM"));

        if (isSuperAdmin) {
            throw new IllegalStateException("Opération impossible : l'autorité globale SuperAdminSystem n'agit pas au sein d'une école locale.");
        }

        if (userDetails.getSchool() == null) {
            throw new IllegalStateException("❌ Configuration requise : Votre compte n'est rattaché à aucun établissement.");
        }

        return userDetails.getSchool().getId();
    }

    @Override
    @Transactional
    public ScheduleFeesResponseDTO create(ScheduleFeesDTO dto, Long schoolId) {
        if (repository.existsByAcademicYearIdAndLevelIdAndOptionIdAndSchoolId(dto.getAcademicYearId(), dto.getLevelId(), dto.getOptionId(), schoolId)) {
            throw new BadRequestException("Une configuration existe déjà pour ce niveau/option dans votre établissement.");
        }

        ScheduleFees fees = ScheduleFees.builder()
                .academicYear(academicYearRepository.findById(dto.getAcademicYearId()).orElseThrow(() -> new ResourceNotFoundException("Année introuvable")))
                .level(levelRepository.findById(dto.getLevelId()).orElseThrow(() -> new ResourceNotFoundException("Niveau introuvable")))
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .school(School.builder().id(schoolId).build())
                .currency(dto.getCurrency())
                .totalAmount(dto.getTotalAmount())
                .paymentFrequency(dto.getPaymentFrequency())
                .numberOfInstallments(dto.getNumberOfInstallments())
                .startDate(dto.getStartDate())
                .active(true)
                .build();

        ScheduleFees saved = repository.save(fees);
        installmentScheduleService.generateInstallments(saved);
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public ScheduleFeesResponseDTO update(Long id, ScheduleFeesDTO dto, Long schoolId) {
        ScheduleFees fees = repository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Barème introuvable dans votre établissement."));

        BigDecimal oldAmount = fees.getTotalAmount();

        String levelName = fees.getLevel().getName();
        String optionPart = (fees.getOption() != null) ? " " + fees.getOption().getOptionName() : "";
        String className = levelName + optionPart;
        String currencyLabel = fees.getCurrency().name();

        fees.setTotalAmount(dto.getTotalAmount());
        fees.setCurrency(dto.getCurrency());
        fees.setPaymentFrequency(dto.getPaymentFrequency());
        fees.setNumberOfInstallments(dto.getNumberOfInstallments());
        fees.setStartDate(dto.getStartDate());

        updateInstallmentsInPlace(fees);

        ScheduleFees updatedFees = repository.saveAndFlush(fees);

        if (oldAmount.compareTo(dto.getTotalAmount()) != 0) {
            notificationService.sendPricingUpdate(
                    className,
                    oldAmount,
                    dto.getTotalAmount(),
                    currencyLabel,
                    schoolId
            );
        }

        if (updatedFees.getLinkedProfiles() != null) {
            for (StudentAnnualFinancialProfile profile : updatedFees.getLinkedProfiles()) {
                profile.refreshFromSchedule();
            }
            profileRepository.saveAll(updatedFees.getLinkedProfiles());
        }

        return mapToResponseDTO(updatedFees);
    }

    private int getMonthsFromFrequency(PaymentFrequency frequency) {
        return switch (frequency) {
            case MONTHLY -> 1;
            case TRIMESTER -> 3;
            case SEMESTER -> 6;
            case ANNUAL -> 12;
        };
    }

    private void updateInstallmentsInPlace(ScheduleFees fees) {
        BigDecimal installmentAmount = fees.getTotalAmount()
                .divide(BigDecimal.valueOf(fees.getNumberOfInstallments()), 2, RoundingMode.HALF_UP);

        List<InstallmentSchedule> currentList = fees.getInstallments();
        int targetCount = fees.getNumberOfInstallments();
        int monthsStep = getMonthsFromFrequency(fees.getPaymentFrequency());

        for (int i = 0; i < Math.min(currentList.size(), targetCount); i++) {
            InstallmentSchedule inst = currentList.get(i);
            inst.setAmount(installmentAmount);
            inst.setStartDate(fees.getStartDate().plusMonths((long) i * monthsStep));
            inst.setDueDate(inst.getStartDate().plusDays(15));
        }

        if (targetCount > currentList.size()) {
            for (int i = currentList.size(); i < targetCount; i++) {
                InstallmentSchedule newInst = InstallmentSchedule.builder()
                        .installmentNumber(i + 1)
                        .amount(installmentAmount)
                        .startDate(fees.getStartDate().plusMonths((long) i * monthsStep))
                        .dueDate(fees.getStartDate().plusMonths((long) i * monthsStep).plusDays(15))
                        .scheduleFees(fees)
                        .paid(false)
                        .build();
                currentList.add(newInst);
            }
        }
        else if (targetCount < currentList.size()) {
            for (int i = currentList.size() - 1; i >= targetCount; i--) {
                InstallmentSchedule instToDelete = currentList.get(i);
                if (instToDelete.getPayments() != null && !instToDelete.getPayments().isEmpty()) {
                    throw new BadRequestException("Impossible de réduire le nombre de tranches : la tranche "
                            + instToDelete.getInstallmentNumber() + " possède déjà des paiements enregistrés.");
                }
                currentList.remove(i);
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id, Long schoolId) {
        ScheduleFees fees = repository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Barème introuvable dans votre établissement."));

        boolean hasAnyPayment = fees.getInstallments().stream()
                .anyMatch(i -> i.getPayments() != null && !i.getPayments().isEmpty());

        if (hasAnyPayment) {
            throw new BadRequestException("Suppression impossible : des paiements sont déjà liés à ce barème.");
        }
        repository.delete(fees);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleFeesResponseDTO> getAll(Long schoolId) {
        // ✅ CORRECTION : Utilisation de la méthode sécurisée par ID établissement
        return academicYearRepository.findByActiveTrueAndSchoolId(schoolId)
                .map(year -> repository.findByAcademicYearIdAndSchoolIdAndActiveTrue(year.getId(), schoolId)
                        .stream().map(this::mapToResponseDTO).toList())
                .orElse(new ArrayList<>());
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleFeesResponseDTO getById(Long id, Long schoolId) {
        return repository.findByIdAndSchoolId(id, schoolId)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable dans votre établissement."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleFeesResponseDTO> getByAcademicYear(Long academicYearId, Long schoolId) {
        return repository.findByAcademicYearIdAndSchoolIdAndActiveTrue(academicYearId, schoolId)
                .stream().map(this::mapToResponseDTO).toList();
    }

    @Override
    @Transactional
    public void deactivate(Long id, Long schoolId) {
        ScheduleFees fees = repository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable dans votre établissement."));
        fees.setActive(false);
        repository.save(fees);
    }

    private ScheduleFeesResponseDTO mapToResponseDTO(ScheduleFees fees) {
        ScheduleFeesResponseDTO dto = new ScheduleFeesResponseDTO();
        dto.setId(fees.getId());
        dto.setAcademicYearId(fees.getAcademicYear().getId());
        dto.setLevelId(fees.getLevel().getId());
        dto.setOptionId(fees.getOption() != null ? fees.getOption().getId() : null);
        dto.setCurrency(fees.getCurrency());
        dto.setTotalAmount(fees.getTotalAmount());
        dto.setNumberOfInstallments(fees.getNumberOfInstallments());
        dto.setPaymentFrequency(fees.getPaymentFrequency());
        dto.setStartDate(fees.getStartDate());
        dto.setActive(fees.getActive());

        if (fees.getInstallments() != null) {
            dto.setInstallments(fees.getInstallments().stream().map(i -> {
                InstallmentScheduleResponseDTO d = new InstallmentScheduleResponseDTO();
                d.setId(i.getId());
                d.setInstallmentNumber(i.getInstallmentNumber());
                d.setAmount(i.getAmount());
                d.setStartDate(i.getStartDate());
                d.setDueDate(i.getDueDate());
                d.setPaid(i.getPaid());
                d.setScheduleFeesId(fees.getId());
                return d;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}