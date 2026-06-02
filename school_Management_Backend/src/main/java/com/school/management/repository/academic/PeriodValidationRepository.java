package com.school.management.repository.academic;

import com.school.management.model.academic.PeriodValidation;
import com.school.management.model.enums.VisaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodValidationRepository extends JpaRepository<PeriodValidation, Long> {

    Optional<PeriodValidation> findByTeacherAssignmentIdAndPeriod(Long teacherAssignmentId, int period);

    // NOUVELLE MÉTHODE : Permet à Spring de générer la requête "SELECT * FROM period_validation WHERE status = ?"
    List<PeriodValidation> findByStatus(VisaStatus status);
}