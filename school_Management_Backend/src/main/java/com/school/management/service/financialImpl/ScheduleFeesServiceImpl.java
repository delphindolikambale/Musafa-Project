package com.school.management.service.financialImpl;

import com.school.management.dto.financial.*;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.enums.PaymentFrequency;
import com.school.management.model.financial.*;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.LevelRepository;
import com.school.management.repository.academic.OptionRepository;
import com.school.management.repository.financial.ScheduleFeesRepository;
import com.school.management.repository.financial.StudentAnnualFinancialProfileRepository;
import com.school.management.service.financial.InstallmentScheduleService;
import com.school.management.service.financial.ScheduleFeesService;
import lombok.RequiredArgsConstructor;
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

    @Override
    @Transactional
    public ScheduleFeesResponseDTO create(ScheduleFeesDTO dto) {
        if (repository.existsByAcademicYearIdAndLevelIdAndOptionId(dto.getAcademicYearId(), dto.getLevelId(), dto.getOptionId())) {
            throw new BadRequestException("Une configuration existe déjà pour ce niveau/option.");
        }

        ScheduleFees fees = ScheduleFees.builder()
                .academicYear(academicYearRepository.findById(dto.getAcademicYearId()).orElseThrow(() -> new ResourceNotFoundException("Année introuvable")))
                .level(levelRepository.findById(dto.getLevelId()).orElseThrow(() -> new ResourceNotFoundException("Niveau introuvable")))
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
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
    public ScheduleFeesResponseDTO update(Long id, ScheduleFeesDTO dto) {
        ScheduleFees fees = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Barème introuvable"));

        // --- PRÉPARATION DE LA NOTIFICATION (CORRIGÉE) ---
        BigDecimal oldAmount = fees.getTotalAmount();

        // Correction ici : getName() pour Level et getOptionName() pour Option
        String levelName = fees.getLevel().getName();
        String optionPart = (fees.getOption() != null) ? " " + fees.getOption().getOptionName() : "";
        String className = levelName + optionPart;

        String currencyLabel = fees.getCurrency().name();
        // ----------------------------------------------------

        // 1. Mise à jour des données de tête
        fees.setTotalAmount(dto.getTotalAmount());
        fees.setCurrency(dto.getCurrency());
        fees.setPaymentFrequency(dto.getPaymentFrequency());
        fees.setNumberOfInstallments(dto.getNumberOfInstallments());
        fees.setStartDate(dto.getStartDate());

        // 2. MISE À JOUR INTELLIGENTE DES TRANCHES
        updateInstallmentsInPlace(fees);

        // 3. Sauvegarde intermédiaire
        ScheduleFees updatedFees = repository.saveAndFlush(fees);

        // --- ENVOI DE LA NOTIFICATION SI LE MONTANT A CHANGÉ ---
        if (oldAmount.compareTo(dto.getTotalAmount()) != 0) {
            notificationService.sendPricingUpdate(
                    className,
                    oldAmount,
                    dto.getTotalAmount(),
                    currencyLabel
            );
        }

        // 4. Propagation vers les profils élèves
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
    public void delete(Long id) {
        ScheduleFees fees = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Barème introuvable"));
        boolean hasAnyPayment = fees.getInstallments().stream()
                .anyMatch(i -> i.getPayments() != null && !i.getPayments().isEmpty());

        if (hasAnyPayment) {
            throw new BadRequestException("Suppression impossible : des paiements sont déjà liés à ce barème.");
        }
        repository.delete(fees);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleFeesResponseDTO> getAll() {
        return academicYearRepository.findByActiveTrue()
                .map(year -> repository.findByAcademicYearIdAndActiveTrue(year.getId())
                        .stream().map(this::mapToResponseDTO).toList())
                .orElse(new ArrayList<>());
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleFeesResponseDTO getById(Long id) {
        return repository.findById(id).map(this::mapToResponseDTO).orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleFeesResponseDTO> getByAcademicYear(Long academicYearId) {
        return repository.findByAcademicYearIdAndActiveTrue(academicYearId).stream().map(this::mapToResponseDTO).toList();
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        ScheduleFees fees = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Configuration introuvable"));
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

