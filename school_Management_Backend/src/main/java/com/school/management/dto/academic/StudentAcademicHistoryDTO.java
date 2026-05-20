package com.school.management.dto.academic;

import com.school.management.model.enums.AcademicStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class StudentAcademicHistoryDTO {
    private Long studentId;
    private Long academicYearId;
    private Long classroomId;
    private Long enrollmentId;

    // ⚠️ OBLIGATOIRE
    private AcademicStatus status;

    private String observation;
}
