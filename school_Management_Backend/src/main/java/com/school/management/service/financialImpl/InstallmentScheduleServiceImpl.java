package com.school.management.service.financialImpl;

import com.school.management.dto.financial.InstallmentScheduleDTO;
import com.school.management.dto.financial.InstallmentScheduleResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.financial.ScheduleFees;
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
    public InstallmentSchedule create(InstallmentScheduleDTO dto) {
        ScheduleFees scheduleFees = scheduleFeesRepository.findById(dto.getScheduleFeesId())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleFees introuvable"));

        InstallmentSchedule installment = InstallmentSchedule.builder()
                .installmentNumber(dto.getInstallmentNumber())
                .amount(dto.getAmount())
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .dueDate(dto.getDueDate())
                .paid(false)
                .scheduleFees(scheduleFees)
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
                    .level(scheduleFees.getLevel())
                    .option(scheduleFees.getOption())
                    .build();

            scheduleFees.getInstallments().add(installment);
            currentStart = dueDate.plusDays(1);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstallmentSchedule> getByScheduleFees(Long scheduleFeesId) {
        return repository.findByScheduleFeesId(scheduleFeesId);
    }

    @Override
    @Transactional(readOnly = true)
    public InstallmentSchedule getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tranche introuvable"));
    }

    @Override
    @Transactional
    public void markAsPaid(Long id) {
        InstallmentSchedule inst = getById(id);
        inst.setPaid(true);
        repository.save(inst);
    }
}
