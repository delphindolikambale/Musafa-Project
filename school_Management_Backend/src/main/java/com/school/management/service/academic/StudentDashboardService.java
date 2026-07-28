package com.school.management.service.academic;

import com.school.management.dto.academic.StudentDashboardDTO;

public interface StudentDashboardService {
    StudentDashboardDTO getStudentDashboard(Long userId, Long schoolId, Long academicYearId);
}