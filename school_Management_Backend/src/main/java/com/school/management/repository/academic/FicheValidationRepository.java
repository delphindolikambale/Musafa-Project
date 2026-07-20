package com.school.management.repository.academic;

import com.school.management.model.academic.FicheValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FicheValidationRepository extends JpaRepository<FicheValidation, Long> {
    Optional<FicheValidation> findByClassroomIdAndSubjectIdAndPeriodIdAndAcademicYearIdAndSchoolId(
            Long classroomId, Long subjectId, String periodId, Long academicYearId, Long schoolId
    );
}
