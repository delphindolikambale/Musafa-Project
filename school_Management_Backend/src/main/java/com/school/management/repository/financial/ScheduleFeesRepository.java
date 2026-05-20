package com.school.management.repository.financial;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Level;
import com.school.management.model.academic.Option;
import com.school.management.model.financial.ScheduleFees;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScheduleFeesRepository extends JpaRepository<ScheduleFees, Long> {

    Optional<ScheduleFees> findByAcademicYearIdAndLevelIdAndOptionIdAndActiveTrue(
            Long academicYearId,
            Long levelId,
            Long optionId
    );
    boolean existsByAcademicYearIdAndLevelIdAndOptionId(
            Long academicYearId,
            Long levelId,
            Long optionId
    );
    List<ScheduleFees> findByAcademicYearIdAndActiveTrue(Long academicYearId);

    Optional<ScheduleFees> findByAcademicYearAndLevelAndOptionAndActiveTrue(
            AcademicYear academicYear,
            Level level,
            Option option
    );

    Optional<ScheduleFees> findByLevelIdAndOptionIdAndAcademicYearId(Long levelId, Long optionId, Long academicYearId);

    // Vous pouvez aussi ajouter celle-ci pour d'autres besoins futurs :
    boolean existsByLevelIdAndOptionIdAndAcademicYearId(Long levelId, Long optionId, Long academicYearId);
}
