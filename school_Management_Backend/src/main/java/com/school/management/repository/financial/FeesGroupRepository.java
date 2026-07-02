package com.school.management.repository.financial;

import com.school.management.model.financial.FeesGroup;
import com.school.management.model.enums.FeesGroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

public interface FeesGroupRepository extends JpaRepository<FeesGroup, Long>{

    boolean existsByAcademicYearIdAndTypeAndSchoolId(Long academicYearId, FeesGroupType type, Long schoolId);
    boolean existsByAcademicYearIdAndTypeAndSchoolIdAndIdNot(Long academicYearId, FeesGroupType type, Long schoolId, Long id);
    List<FeesGroup> findByAcademicYearIdAndSchoolId(Long academicYearId, Long schoolId);
    List<FeesGroup> findBySchoolId(Long schoolId);
    List<FeesGroup> findByAcademicYearIdAndSchoolIdAndActiveTrue(Long academicYearId, Long schoolId);
    Optional<FeesGroup> findByAcademicYearIdAndTypeAndSchoolId(Long academicYearId, FeesGroupType type, Long schoolId);
    Optional<FeesGroup> findByIdAndSchoolId(Long id, Long schoolId);

    @Query("SELECT COALESCE(SUM(fg.percentage), 0) FROM FeesGroup fg WHERE fg.academicYear.id = :academicYearId AND fg.school.id = :schoolId AND fg.active = true")
    BigDecimal sumPercentageByAcademicYearIdAndSchoolId(@Param("academicYearId") Long academicYearId, @Param("schoolId") Long schoolId);

}