package com.school.management.repository.academic;

import com.school.management.model.academic.PeriodValidation;
import com.school.management.model.enums.VisaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodValidationRepository extends JpaRepository<PeriodValidation, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Recherche d'un visa spécifique par école
    Optional<PeriodValidation> findByTeacherAssignmentIdAndPeriodAndSchoolId(Long teacherAssignmentId, int period, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Récupération des visas en attente uniquement pour l'école du Proviseur connecté
    List<PeriodValidation> findByStatusAndSchoolId(VisaStatus status, Long schoolId);
}