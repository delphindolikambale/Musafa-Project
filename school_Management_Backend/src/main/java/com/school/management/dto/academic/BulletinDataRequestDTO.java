package com.school.management.dto.academic;

import lombok.Data;

@Data
public class BulletinDataRequestDTO {
    private Long studentId;
    private Long academicYearId;
    private Long classroomId;
}