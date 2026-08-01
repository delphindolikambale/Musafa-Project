package com.school.management.dto.academic.attendance;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class DailyAttendanceStatusResponseDTO {
    private Long sessionId;
    private LocalDate date;
    private Long classroomId;
    private String classroomName;
    private boolean morningDone;
    private boolean eveningDone;
    private List<StudentAttendanceResponseDTO> students;
}