package com.school.management.service.academic;

import com.school.management.dto.academic.StudentMarkDTO;

import java.util.List;

public interface StudentMarkService {

    void updateStudentMark(Long markId, double newValue);
    List<StudentMarkDTO> getMarksByEvaluation(Long evaluationTaskId);
    List<StudentMarkDTO> getStudentMarksForAssignment(Long studentId, Long teacherAssignmentId);
}
