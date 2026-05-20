package com.school.management.controller.academic;

import com.school.management.dto.academic.EnrollmentResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Student;
import com.school.management.service.academic.EnrollmentService;
import com.school.management.service.academic.StudentService;
import com.school.management.service.academicImpl.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/register-student-dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5170" , "http://localhost:5180"}, allowCredentials = "true")
@RequiredArgsConstructor

public class RegisterStudentDashboardController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;
    private final AcademicYearService academicYearService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Année active
        AcademicYear activeYear = academicYearService.getAnneeActive();
        Long activeYearId = (activeYear != null) ? activeYear.getId() : null;

        // 2. Données GLOBALES (pour le PieChart et les cartes de base)
        List<Student> allStudents = studentService.getAllStudents();
        long totalStudents = allStudents.size();

        long totalBoys = allStudents.stream()
                .filter(s -> s.getGender() != null && s.getGender().name().startsWith("M"))
                .count();
        long totalGirls = allStudents.stream()
                .filter(s -> s.getGender() != null && s.getGender().name().startsWith("F"))
                .count();

        // 3. Données de l'ANNÉE ACTIVE (pour la carte Inscriptions et le BarChart)
        List<EnrollmentResponseDTO> activeEnrollments = enrollmentService.getAllEnrollments(activeYearId);
        long activeYearEnrollmentsCount = activeEnrollments.size();

        long boysActive = activeEnrollments.stream()
                .filter(e -> e.getGender() != null && e.getGender().startsWith("M"))
                .count();
        long girlsActive = activeEnrollments.stream()
                .filter(e -> e.getGender() != null && e.getGender().startsWith("F"))
                .count();

        // 4. Dernières inscriptions (Activité récente)
        List<Map<String, String>> recentRegistrations = allStudents.stream()
                .sorted((s1, s2) -> s2.getId().compareTo(s1.getId()))
                .limit(3)
                .map(s -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("matricule", s.getMatricule() != null ? s.getMatricule() : "NOU");
                    map.put("fullName", s.getFullName());
                    map.put("status", s.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList());

        // Couleurs : Orange pour Garçons (#f59e0b), Vert pour Filles (#10b981)

        // Données pour le BarChart (Année Active uniquement)
        List<Map<String, Object>> activeYearChartData = List.of(
                Map.of("name", "Garçons", "value", boysActive, "fill", "#10b981"),
                Map.of("name", "Filles", "value", girlsActive, "fill", "#f59e0b")
        );

        // Données pour le PieChart (Globalité des élèves)
        List<Map<String, Object>> globalGenderChartData = List.of(
                Map.of("name", "Garçons", "value", totalBoys, "fill", "#10b981"),
                Map.of("name", "Filles", "value", totalGirls, "fill", "#f59e0b")
        );

        stats.put("activeYear", activeYear != null ? activeYear.getAnnee() : "N/A");
        stats.put("totalStudents", totalStudents);
        stats.put("totalBoys", totalBoys);
        stats.put("totalGirls", totalGirls);
        stats.put("activeYearEnrollments", activeYearEnrollmentsCount);
        stats.put("recentRegistrations", recentRegistrations);
        stats.put("activeYearChartData", activeYearChartData);
        stats.put("globalGenderChartData", globalGenderChartData);

        return ResponseEntity.ok(stats);
    }
}
