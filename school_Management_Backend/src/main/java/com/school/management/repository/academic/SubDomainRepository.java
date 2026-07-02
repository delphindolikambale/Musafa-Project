package com.school.management.repository.academic;

import com.school.management.model.academic.SubDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubDomainRepository extends JpaRepository<SubDomain, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Sécurisation par schoolId
    @Query("SELECT s FROM SubDomain s WHERE s.school.id = :schoolId AND s.level.id = :levelId " +
            "AND ((s.section IS NULL AND :sectionId IS NULL) OR (s.section.id = :sectionId)) " +
            "AND ((s.option IS NULL AND :optionId IS NULL) OR (s.option.id = :optionId)) " +
            "AND s.academicYear.id = :yearId ORDER BY s.orderIndex ASC")
    List<SubDomain> findByClassContext(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId,
            @Param("schoolId") Long schoolId
    );

    // ✅ ADAPTATION MULTI-TENANT : Liste globale restreinte à l'école
    List<SubDomain> findAllBySchoolId(Long schoolId);
}