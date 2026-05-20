package com.school.management.repository.academic;

import com.school.management.model.academic.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomainRepository extends JpaRepository<Domain, Long> {

    @Query("SELECT d FROM Domain d WHERE d.level.id = :levelId " +
            "AND ((d.section IS NULL AND :sectionId IS NULL) OR (d.section.id = :sectionId)) " +
            "AND ((d.option IS NULL AND :optionId IS NULL) OR (d.option.id = :optionId)) " +
            "AND d.academicYear.id = :yearId ORDER BY d.orderIndex ASC")
    List<Domain> findByClassContext(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId
    );

    // Recherche des domaines exigeant une compétence spécifique
    List<Domain> findByRequiredSpecialityId(Long specialityId);
}
