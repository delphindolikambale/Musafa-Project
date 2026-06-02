package com.school.management.service.academic;

import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.EvaluationCreateDTO;
import com.school.management.dto.academic.EvaluationResponseDTO;

import java.util.List;

public interface EvaluationService {

    void createEvaluationWithMarks(EvaluationCreateDTO dto);
    List<EvaluationResponseDTO> getEvaluationsByAssignment(Long teacherAssignmentId, int period);
    double getCurrentPeriodTotalMax(Long teacherAssignmentId, int period);

    // Récupérer la configuration des maxima de l'affectation
    CourseAssignmentResponseDTO getCourseConfigByAssignment(Long teacherAssignmentId);
}