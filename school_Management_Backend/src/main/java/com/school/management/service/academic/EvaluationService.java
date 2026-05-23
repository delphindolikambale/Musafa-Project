package com.school.management.service.academic;

import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.EvaluationCreateDTO;
import com.school.management.dto.academic.EvaluationResponseDTO;
import com.school.management.model.enums.VisaStatus;

import java.util.List;

public interface EvaluationService {

    void createEvaluationWithMarks(EvaluationCreateDTO dto);
    List<EvaluationResponseDTO> getEvaluationsByAssignment(Long teacherAssignmentId, int period);
    double getCurrentPeriodTotalMax(Long teacherAssignmentId, int period);

    // Méthodes pour le Visa
    void submitPeriodForVisa(Long teacherAssignmentId, int period);
    VisaStatus getPeriodVisaStatus(Long teacherAssignmentId, int period);

    // Récupérer la configuration des maxima de l'affectation
    CourseAssignmentResponseDTO getCourseConfigByAssignment(Long teacherAssignmentId);
}
