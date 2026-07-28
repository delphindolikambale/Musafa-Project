package com.school.management.controller.academic;

import com.school.management.dto.academic.StudentDashboardDTO;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.academic.StudentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StudentDashboardController {

    private final StudentDashboardService studentDashboardService;

    @GetMapping
    public ResponseEntity<StudentDashboardDTO> getStudentDashboard(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestHeader("X-School-Id") Long schoolId,
            @RequestParam Long academicYearId) {

        Long userId = userDetails.getId();
        StudentDashboardDTO dashboardData = studentDashboardService.getStudentDashboard(userId, schoolId, academicYearId);
        return ResponseEntity.ok(dashboardData);
    }
}