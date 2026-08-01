package com.school.management.dto.academic.attendance;

import com.school.management.model.enums.AttendanceStatus;
import com.school.management.model.enums.Gender;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentAttendanceResponseDTO {
    private Long studentId;
    private String matricule;
    private String fullName;
    private Gender gender;
    private AttendanceStatus morningStatus;
    private AttendanceStatus eveningStatus;
    private AttendanceStatus finalStatus;
    private String finalSymbol;
    private String remarks;
}