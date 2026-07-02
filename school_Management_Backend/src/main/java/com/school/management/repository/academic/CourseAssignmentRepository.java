package com.school.management.repository.academic;

import com.school.management.model.academic.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CourseAssignmentRepository extends JpaRepository<CourseAssignment, Long> {

    /**
     * ✅ MULTI-TENANT : Récupère la configuration avec isolation par école.
     */
    @Query("SELECT c FROM CourseAssignment c WHERE c.level.id = :levelId " +
            "AND ((c.section IS NULL AND :sectionId IS NULL) OR (c.section.id = :sectionId)) " +
            "AND ((c.option IS NULL AND :optionId IS NULL) OR (c.option.id = :optionId)) " +
            "AND c.academicYear.id = :yearId AND c.school.id = :schoolId")
    List<CourseAssignment> findByPedagogicalKey(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId,
            @Param("schoolId") Long schoolId
    );

    /**
     * ✅ MULTI-TENANT : Vérifie l'existence d'un cours au sein de la même école.
     */
    @Query("SELECT COUNT(c) > 0 FROM CourseAssignment c WHERE c.level.id = :levelId " +
            "AND ((c.section IS NULL AND :sectionId IS NULL) OR (c.section.id = :sectionId)) " +
            "AND ((c.option IS NULL AND :optionId IS NULL) OR (c.option.id = :optionId)) " +
            "AND c.subject.id = :subjectId " +
            "AND c.academicYear.id = :yearId AND c.school.id = :schoolId")
    boolean existsByPedagogicalKeyAndSubject(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("subjectId") Long subjectId,
            @Param("yearId") Long yearId,
            @Param("schoolId") Long schoolId
    );

    List<CourseAssignment> findBySubjectIdAndSchoolId(Long subjectId, Long schoolId);

    void deleteByLevelIdAndSectionIdAndOptionIdAndAcademicYearIdAndSchoolId(
            Long levelId,
            Long sectionId,
            Long optionId,
            Long academicYearId,
            Long schoolId
    );

    Optional<CourseAssignment> findBySubjectAndLevelAndSectionAndOptionAndAcademicYearAndSchoolId(Subject subject, Level level, Section section, Option option, AcademicYear targetYear, Long schoolId);

    /**
     * ✅ MULTI-TENANT : Recherche l'équivalent dans une année cible sécurisée par école.
     */
    @Query("SELECT c FROM CourseAssignment c WHERE c.subject.name = :subjectName " +
            "AND c.level.name = :levelName " +
            "AND ((c.section IS NULL AND :sectionName IS NULL) OR (c.section.sectionName = :sectionName)) " +
            "AND ((c.option IS NULL AND :optionName IS NULL) OR (c.option.optionName = :optionName)) " +
            "AND c.academicYear.id = :yearId AND c.school.id = :schoolId")
    Optional<CourseAssignment> findByLogicalKeyInYear(
            @Param("subjectName") String subjectName,
            @Param("levelName") String levelName,
            @Param("sectionName") String sectionName,
            @Param("optionName") String optionName,
            @Param("yearId") Long yearId,
            @Param("schoolId") Long schoolId
    );

    List<CourseAssignment> findByLevelIdAndAcademicYearIdAndSchoolId(Long levelId, Long academicYearId, Long schoolId);
}