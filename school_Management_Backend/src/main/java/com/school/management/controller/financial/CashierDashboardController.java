package com.school.management.controller.financial;

import com.school.management.dto.financial.CashierDashboardDTO;
import com.school.management.service.financial.CashierDashboardService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class CashierDashboardController {

    private final CashierDashboardService dashboardService;

    /**
     * Extraction contextuelle de l'école depuis le token d'authentification JWT
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof SchoolContextDetails) {
                return ((SchoolContextDetails) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @GetMapping("/cashier-stats")
    public ResponseEntity<CashierDashboardDTO> getStats(@RequestParam Long academicYearId) {
        // ✅ Extraction sécurisée de l'école depuis le contexte de sécurité (plus besoin de l'en-tête X-School-Id)
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(dashboardService.getGlobalStats(academicYearId, currentSchool.getId()));
    }
}