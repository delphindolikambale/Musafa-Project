package com.school.management.repository.financial;

import com.school.management.model.financial.ScheduleFees;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleFeesRepository extends JpaRepository<ScheduleFees, Long> {

    // ✅ SÉCURISÉ : Recherche par ID avec verrou de scope d'école
    Optional<ScheduleFees> findByIdAndSchoolId(Long id, Long schoolId);

    Optional<ScheduleFees> findByAcademicYearIdAndLevelIdAndOptionIdAndSchoolIdAndActiveTrue(
            Long academicYearId,
            Long levelId,
            Long optionId,
            Long schoolId
    );

    boolean existsByAcademicYearIdAndLevelIdAndOptionIdAndSchoolId(
            Long academicYearId,
            Long levelId,
            Long optionId,
            Long schoolId
    );

    List<ScheduleFees> findByAcademicYearIdAndSchoolIdAndActiveTrue(Long academicYearId, Long schoolId);

    Optional<ScheduleFees> findByLevelIdAndOptionIdAndAcademicYearIdAndSchoolId(Long levelId, Long optionId, Long academicYearId, Long schoolId);

    boolean existsByLevelIdAndOptionIdAndAcademicYearIdAndSchoolId(Long levelId, Long optionId, Long academicYearId, Long schoolId);
}