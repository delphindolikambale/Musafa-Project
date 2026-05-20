package com.school.management.repository.academic;

import com.school.management.model.academic.PeriodValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface PeriodValidationRepository extends JpaRepository<PeriodValidation, Long> {
    Optional<PeriodValidation> findByTeacherAssignmentIdAndPeriod(Long teacherAssignmentId, int period);
}
