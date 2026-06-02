package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingGradeSheetDTO {
    private Long teacherAssignmentId;
    private int period;
    private String subjectName;
    private String classroomName;
    private String teacherName;
    private LocalDateTime submissionDate;
}