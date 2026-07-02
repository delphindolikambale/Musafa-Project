package com.school.management.repository.financial;

import com.school.management.model.financial.InstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstallmentScheduleRepository extends JpaRepository<InstallmentSchedule, Long>{

    Optional<InstallmentSchedule> findByIdAndSchoolId(Long id, Long schoolId);

    List<InstallmentSchedule> findByScheduleFeesIdAndSchoolIdAndPaidFalseOrderByInstallmentNumberAsc(Long scheduleFeesId, Long schoolId);

    List<InstallmentSchedule> findByScheduleFeesIdAndSchoolId(Long scheduleFeesId, Long schoolId);

    List<InstallmentSchedule> findByScheduleFeesIdAndSchoolIdOrderByInstallmentNumberAsc(Long scheduleFeesId, Long schoolId);

    boolean existsByScheduleFeesIdAndInstallmentNumberAndSchoolId(Long scheduleFeesId, Integer installmentNumber, Long schoolId);
}