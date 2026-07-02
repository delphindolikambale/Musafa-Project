package com.school.management.repository.academic;

import com.school.management.model.academic.StudentMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentMarkRepository extends JpaRepository<StudentMark, Long> {

    List<StudentMark> findByEvaluationTaskId(Long taskId);

    List<StudentMark> findByStudentIdAndEvaluationTaskTeacherAssignmentId(Long studentId, Long taId);

    // ✅ ADAPTATION MULTI-TENANT & PERFORMANCE : Récupère uniquement les notes de l'élève ciblé
    List<StudentMark> findByStudentId(Long studentId);

    // ✅ AJOUT CORRECTIF MULTI-TENANT : Nécessaire pour la méthode getMarksByEvaluation du Service
    List<StudentMark> findByEvaluationTaskIdAndSchoolId(Long taskId, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Récupération sécurisée et isolée des notes d'un élève pour une affectation spécifique d'un établissement
    List<StudentMark> findByStudentIdAndEvaluationTaskTeacherAssignmentIdAndSchoolId(Long studentId, Long taId, Long schoolId);
}