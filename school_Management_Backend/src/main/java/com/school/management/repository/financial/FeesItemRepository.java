package com.school.management.repository.financial;

import com.school.management.model.financial.FeesItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FeesItemRepository extends JpaRepository<FeesItem, Long>{

    List<FeesItem> findByFeesGroupIdAndSchoolIdAndActiveTrue(Long feesGroupId, Long schoolId);
    List<FeesItem> findBySchoolId(Long schoolId);
    boolean existsByAcademicYearIdAndNameFeesItemAndSchoolIdAndActiveTrue(Long academicYearId, String nameFeesItem, Long schoolId);
    boolean existsByAcademicYearIdAndNameFeesItemAndSchoolIdAndActiveTrueAndIdNot(Long academicYearId, String nameFeesItem, Long schoolId, Long id);
    Optional<FeesItem> findByIdAndSchoolId(Long id, Long schoolId);

    @Query("SELECT COALESCE(SUM(fi.percentage), 0) FROM FeesItem fi WHERE fi.feesGroup.id = :feesGroupId AND fi.academicYear.id = :academicYearId AND fi.school.id = :schoolId AND fi.active = true")
    BigDecimal sumPercentageByFeesGroupIdAndAcademicYearIdAndSchoolId(@Param("feesGroupId") Long feesGroupId, @Param("academicYearId") Long academicYearId, @Param("schoolId") Long schoolId);
}