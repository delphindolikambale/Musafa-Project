package com.school.management.service.financialImpl;

import com.school.management.dto.financial.InstallmentScheduleDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.financial.ScheduleFees;
import com.school.management.model.multitenant.School;
import com.school.management.repository.financial.InstallmentScheduleRepository;
import com.school.management.repository.financial.ScheduleFeesRepository;
import com.school.management.service.financial.InstallmentScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstallmentScheduleServiceImpl implements InstallmentScheduleService {

    private final InstallmentScheduleRepository repository;
    private final ScheduleFeesRepository scheduleFeesRepository;

    @Override
    @Transactional
    public InstallmentSchedule create(InstallmentScheduleDTO dto, Long schoolId) {
        // Validation que le barème de tête appartient bien à l'école active
        ScheduleFees scheduleFees = scheduleFeesRepository.findByIdAndSchoolId(dto.getScheduleFeesId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleFees introuvable dans votre établissement."));

        InstallmentSchedule installment = InstallmentSchedule.builder()
                .installmentNumber(dto.getInstallmentNumber())
                .amount(dto.getAmount())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .dueDate(dto.getDueDate())
                .paid(false)
                .scheduleFees(scheduleFees)
                .school(School.builder().id(schoolId).build()) // ✅ Isolation Multi-Tenant
                .level(scheduleFees.getLevel())
                .option(scheduleFees.getOption())
                .build();

        return repository.save(installment);
    }

    @Override
    @Transactional
    public void generateInstallments(ScheduleFees scheduleFees) {
        int number = scheduleFees.getNumberOfInstallments();
        BigDecimal total = scheduleFees.getTotalAmount();

        BigDecimal baseAmount = total.divide(BigDecimal.valueOf(number), 2, RoundingMode.DOWN);
        BigDecimal remainder = total.subtract(baseAmount.multiply(BigDecimal.valueOf(number)));

        int monthsStep = switch (scheduleFees.getPaymentFrequency()) {
            case MONTHLY -> 1;
            case TRIMESTER -> 3;
            case SEMESTER -> 6;
            case ANNUAL -> 12;
        };

        LocalDate currentStart = scheduleFees.getStartDate();

        if (scheduleFees.getInstallments() == null) {
            scheduleFees.setInstallments(new ArrayList<>());
        }

        for (int i = 1; i <= number; i++) {
            BigDecimal installmentAmount = (i == number) ? baseAmount.add(remainder) : baseAmount;
            LocalDate dueDate = currentStart.plusMonths(monthsStep).minusDays(1);

            InstallmentSchedule installment = InstallmentSchedule.builder()
                    .installmentNumber(i)
                    .amount(installmentAmount)
                    .startDate(currentStart)
                    .dueDate(dueDate)
                    .paid(false)
                    .scheduleFees(scheduleFees)
                    .school(scheduleFees.getSchool()) // ✅ Propagation automatique de l'école parente
                    .level(scheduleFees.getLevel())
                    .option(scheduleFees.getOption())
                    .build();

            scheduleFees.getInstallments().add(installment);
            currentStart = dueDate.plusDays(1);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstallmentSchedule> getByScheduleFees(Long scheduleFeesId, Long schoolId) {
        return repository.findByScheduleFeesIdAndSchoolId(scheduleFeesId, schoolId);
    }

    @Override
    @Transactional(readOnly = true)
    public InstallmentSchedule getById(Long id, Long schoolId) {
        return repository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Tranche introuvable dans votre établissement."));
    }

    @Override
    @Transactional
    public void markAsPaid(Long id, Long schoolId) {
        InstallmentSchedule inst = getById(id, schoolId);
        inst.setPaid(true);
        repository.save(inst);
    }
}