package com.school.management.repository.academic;

import com.school.management.model.academic.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // ADAPTATION MAJEURE : Remplacement de la contrainte stricte sur levelId par une logique optionnelle.
    // Cette structure garantit que si levelId est null (Ex: Vue matricielle globale d'un cycle),
    // le système renvoie les cours de tous les niveaux liés à cette section/option.
    @Query("SELECT s FROM Subject s " +
            "LEFT JOIN s.section sec " +
            "LEFT JOIN s.option opt " +
            "WHERE (:levelId IS NULL OR s.level.id = :levelId) " +
            "AND ((:sectionId IS NULL AND sec IS NULL) OR (sec.id = :sectionId)) " +
            "AND ((:optionId IS NULL AND opt IS NULL) OR (opt.id = :optionId)) " +
            "AND s.academicYear.id = :yearId")
    List<Subject> findByClassContext(
            @Param("levelId") Long levelId,
            @Param("sectionId") Long sectionId,
            @Param("optionId") Long optionId,
            @Param("yearId") Long yearId
    );

    // ADAPTATION SIMILAIRE : Application de la même logique stricte pour l'affichage
    // de l'emploi du temps personnalisé côté espace étudiant.
    @Query("SELECT s FROM Subject s " +
            "LEFT JOIN s.section sec " +
            "LEFT JOIN s.option opt " +
            "JOIN Enrollment e ON e.classroom.level.id = s.level.id " +
            "LEFT JOIN e.classroom.section cSec " +
            "LEFT JOIN e.classroom.option cOpt " +
            "WHERE e.student.user.id = :userId " +
            "AND e.active = true " +
            "AND ((sec IS NULL AND cSec IS NULL) OR (sec.id = cSec.id)) " +
            "AND ((opt IS NULL AND cOpt IS NULL) OR (opt.id = cOpt.id)) " +
            "AND e.academicYear.id = s.academicYear.id")
    List<Subject> findSubjectsByStudentUserId(@Param("userId") Long userId);
}