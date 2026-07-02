package com.school.management.service.financial;

import com.school.management.dto.financial.InstallmentScheduleDTO;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.financial.ScheduleFees;

import java.util.List;

public interface InstallmentScheduleService {

    // ✅ Signatures adaptées pour intégrer le cloisonnement contextuel
    InstallmentSchedule create(InstallmentScheduleDTO dto, Long schoolId);

    List<InstallmentSchedule> getByScheduleFees(Long scheduleFeesId, Long schoolId);

    InstallmentSchedule getById(Long id, Long schoolId);

    void markAsPaid(Long id, Long schoolId);

    void generateInstallments(ScheduleFees scheduleFees);
}