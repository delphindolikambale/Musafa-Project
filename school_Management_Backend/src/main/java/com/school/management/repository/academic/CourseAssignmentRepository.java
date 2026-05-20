package com.school.management.repository.academic;
import com.school.management.model.academic.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Long> {
    /**
     * Récupère la configuration pédagogique exacte d'une filière.
     */
    @Query("SELECT c FROM CourseAssignment c WHERE c.level.id = :levelId " +
            "AND ((c.section IS NULL AND :sectionId IS NULL) OR (c.section.id = :sectionId)) " +
            "AND ((c.option IS NULL AND :optionId IS NULL) OR (c.option.id = :optionId)) " +
            "AND c.academicYear.id = :yearId")
    List<CourseAssignment> findByPedagogicalKey(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId
    );

    /**
     * Vérifie si un cours (matière) est déjà configuré pour cette filière spécifique.
     */
    @Query("SELECT COUNT(c) > 0 FROM CourseAssignment c WHERE c.level.id = :levelId " +
            "AND ((c.section IS NULL AND :sectionId IS NULL) OR (c.section.id = :sectionId)) " +
            "AND ((c.option IS NULL AND :optionId IS NULL) OR (c.option.id = :optionId)) " +
            "AND c.subject.id = :subjectId " +
            "AND c.academicYear.id = :yearId")
    boolean existsByPedagogicalKeyAndSubject(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("subjectId") Long subjectId,
            @Param("yearId") Long yearId
    );

    List<CourseAssignment> findBySubjectId(Long subjectId);

    void deleteByLevelIdAndSectionIdAndOptionIdAndAcademicYearId(
            Long levelId,
            Long sectionId,
            Long optionId,
            Long academicYearId
    );

    Optional<CourseAssignment> findBySubjectAndLevelAndSectionAndOptionAndAcademicYear(Subject subject, Level level, Section section, Option option, AcademicYear targetYear);

    /**
     * NOUVEAU : Recherche l'équivalent d'un CourseAssignment dans une année cible
     * en se basant sur les noms des entités liées (clonage logique).
     */
    @Query("SELECT c FROM CourseAssignment c WHERE c.subject.name = :subjectName " +
            "AND c.level.name = :levelName " +
            "AND ((c.section IS NULL AND :sectionName IS NULL) OR (c.section.sectionName = :sectionName)) " +
            "AND ((c.option IS NULL AND :optionName IS NULL) OR (c.option.optionName = :optionName)) " +
            "AND c.academicYear.id = :yearId")
    Optional<CourseAssignment> findByLogicalKeyInYear(
            @Param("subjectName") String subjectName,
            @Param("levelName") String levelName,
            @Param("sectionName") String sectionName,
            @Param("optionName") String optionName,
            @Param("yearId") Long yearId
    );
}
