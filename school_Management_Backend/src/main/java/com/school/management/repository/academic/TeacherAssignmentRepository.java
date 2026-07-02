package com.school.management.repository.academic;

import com.school.management.model.academic.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {
    // ✅ TOUTES LES MÉTHODES INCLUSENT DÉSORMAIS L'ISOLATION STRICTE DE L'ÉCOLE (schoolId)
    List<TeacherAssignment> findByAcademicYearIdAndSchoolId(Long yearId, Long schoolId);
    List<TeacherAssignment> findByTeacherIdAndAcademicYearIdAndSchoolId(Long teacherId, Long yearId, Long schoolId);
    List<TeacherAssignment> findByClassroomIdAndAcademicYearIdAndSchoolId(Long classroomId, Long yearId, Long schoolId);

    // Pour vérifier si un cours dans une classe a déjà un enseignant au sein de l'établissement
    Optional<TeacherAssignment> findByCourseAssignmentIdAndClassroomIdAndSchoolId(Long courseId, Long classroomId, Long schoolId);
}