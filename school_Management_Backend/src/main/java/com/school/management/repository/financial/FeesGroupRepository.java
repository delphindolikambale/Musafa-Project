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

    boolean existsByAcademicYearIdAndType(Long academicYearId, FeesGroupType type);
    boolean existsByAcademicYearIdAndTypeAndIdNot(Long academicYearId, FeesGroupType type, Long id);
    List<FeesGroup> findByAcademicYearId(Long academicYearId);
    List<FeesGroup> findByAcademicYearIdAndActiveTrue(Long academicYearId);
    Optional<FeesGroup> findByAcademicYearIdAndType(Long academicYearId, FeesGroupType type);

    @Query("SELECT COALESCE(SUM(fg.percentage), 0) FROM FeesGroup fg WHERE fg.academicYear.id = :academicYearId AND fg.active = true")
    BigDecimal sumPercentageByAcademicYearId(@Param("academicYearId") Long academicYearId);
}
