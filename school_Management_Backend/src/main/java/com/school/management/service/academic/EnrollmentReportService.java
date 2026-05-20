package com.school.management.service.academic;

import com.school.management.model.academic.Enrollment;

import java.util.List;

public interface EnrollmentReportService {
    List<Enrollment> getEnrollmentsByClassroom(
            Long classroomId,
            Long academicYearId
    );
}
