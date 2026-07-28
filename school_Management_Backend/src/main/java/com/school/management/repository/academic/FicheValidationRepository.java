package com.school.management.repository.academic;

import com.school.management.model.academic.FicheValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FicheValidationRepository extends JpaRepository<FicheValidation, Long> {

    Optional<FicheValidation> findByClassroomIdAndSubjectIdAndPeriodIdAndAcademicYearIdAndSchoolId(
            Long classroomId, Long subjectId, String periodId, Long academicYearId, Long schoolId
    );

    // ✅ NOUVEAU : Comptage total des fiches de notes reçues/validées pour l'établissement
    long countBySchoolId(Long schoolId);
}