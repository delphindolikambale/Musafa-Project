package com.school.management.service.academic;

import com.school.management.dto.academic.TeacherAssignmentRequestDTO;
import com.school.management.dto.academic.TeacherAssignmentResponseDTO;

import java.util.List;

public interface TeacherAssignmentService {

    TeacherAssignmentResponseDTO assignTeacher(TeacherAssignmentRequestDTO dto);
    TeacherAssignmentResponseDTO updateAssignment(Long id, TeacherAssignmentRequestDTO dto);
    List<TeacherAssignmentResponseDTO> getAssignmentsByClass(Long classroomId, Long yearId);
    List<TeacherAssignmentResponseDTO> getAssignmentsByTeacher(Long teacherId, Long yearId);
    void deleteAssignment(Long id);

    // Nouvelle méthode pour le report d'une année à l'autre
    void importAssignmentsFromPreviousYear(Long sourceYearId, Long targetYearId);

    // NOUVELLE METHODE
    TeacherAssignmentResponseDTO getAssignmentById(Long id);

    /**
     * Calcule le taux de réussite des élèves pour un cours spécifique (affectation).
     * @param teacherAssignmentId ID de l'affectation de l'enseignant
     * @return Le pourcentage de réussite (ex: 75.0)
     */
    double getCourseSuccessRate(Long teacherAssignmentId);
}