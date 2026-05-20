package com.school.management.repository.financial;

import com.school.management.model.financial.FeesItem;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
public interface FeesItemRepository extends JpaRepository<FeesItem, Long>{

    List<FeesItem> findByFeesGroupIdAndActiveTrue(Long feesGroupId);
    boolean existsByAcademicYearIdAndNameFeesItemAndActiveTrue(Long academicYearId, String nameFeesItem);
    boolean existsByAcademicYearIdAndNameFeesItemAndActiveTrueAndIdNot(Long academicYearId, String nameFeesItem, Long id);

    @Query("SELECT COALESCE(SUM(fi.percentage), 0) FROM FeesItem fi WHERE fi.feesGroup.id = :feesGroupId AND fi.academicYear.id = :academicYearId AND fi.active = true")
    BigDecimal sumPercentageByFeesGroupIdAndAcademicYearId(@Param("feesGroupId") Long feesGroupId, @Param("academicYearId") Long academicYearId);
}
