package com.school.management.dto.academic;

import lombok.Data;

@Data
public class TeacherAssignmentRequestDTO {

    private Long teacherId;
    private Long courseAssignmentId;
    private Long classroomId;
    private Long academicYearId;
    private double weeklyHours;
    private boolean isClassMaster;
}
