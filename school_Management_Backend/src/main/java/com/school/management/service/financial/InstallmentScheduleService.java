package com.school.management.service.financial;

import com.school.management.dto.financial.InstallmentScheduleDTO;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.financial.ScheduleFees;

import java.util.List;

public interface InstallmentScheduleService {

    InstallmentSchedule create(InstallmentScheduleDTO dto);

    List<InstallmentSchedule> getByScheduleFees(Long scheduleFeesId);

    InstallmentSchedule getById(Long id);

    void markAsPaid(Long id);

    void generateInstallments(ScheduleFees scheduleFees);
}
