package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class TeacherAssignmentResponseDTO {
    private Long id;
    private Long teacherId;
    private String teacherFullName;
    private Long courseAssignmentId;
    private String subjectName;
    private Long classroomId;
    private String classroomName; // ex: 4ème Technique A
    private double weeklyHours;
    private boolean isClassMaster;
    private String academicYear;
}
