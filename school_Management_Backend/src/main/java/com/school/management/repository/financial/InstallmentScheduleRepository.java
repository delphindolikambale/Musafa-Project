package com.school.management.repository.financial;

import com.school.management.model.financial.InstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstallmentScheduleRepository extends JpaRepository<InstallmentSchedule, Long>{

    List<InstallmentSchedule>
    findByScheduleFeesIdAndPaidFalseOrderByInstallmentNumberAsc(Long scheduleFeesId);

    List<InstallmentSchedule> findByScheduleFeesId(Long scheduleFeesId);

    List<InstallmentSchedule>
    findByScheduleFeesIdOrderByInstallmentNumberAsc(Long scheduleFeesId);

    boolean existsByScheduleFeesIdAndInstallmentNumber(
            Long scheduleFeesId,
            Integer installmentNumber
    );
}
