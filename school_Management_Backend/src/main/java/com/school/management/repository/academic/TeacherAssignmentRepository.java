package com.school.management.repository.academic;

import com.school.management.model.academic.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {
    List<TeacherAssignment> findByAcademicYearId(Long yearId);
    List<TeacherAssignment> findByTeacherIdAndAcademicYearId(Long teacherId, Long yearId);
    List<TeacherAssignment> findByClassroomIdAndAcademicYearId(Long classroomId, Long yearId);

    // Pour vérifier si un cours dans une classe a déjà un enseignant (Règle d'exclusivité)
    Optional<TeacherAssignment> findByCourseAssignmentIdAndClassroomId(Long courseId, Long classroomId);
}
