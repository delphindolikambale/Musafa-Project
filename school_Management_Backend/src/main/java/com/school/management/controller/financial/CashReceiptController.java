package com.school.management.controller.financial;

import com.school.management.dto.financial.CashReceiptDashboardDTO;
import com.school.management.service.financial.CashReceiptService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/cash-receipts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class CashReceiptController {

    private final CashReceiptService cashReceiptService;

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

    /**
     * Endpoint dynamique pour le flux de trésorerie avec isolation multi-tenant.
     * @param filter : DAILY, WEEKLY, MONTHLY, ANNUAL
     * @param date : La date de référence
     * @param classroomId : Optionnel pour filtrer par classe
     */
    @GetMapping("/summary")
    public ResponseEntity<CashReceiptDashboardDTO> getCashSummary(
            @RequestParam(defaultValue = "DAILY") String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long classroomId) {

        // ✅ Extraction sécurisée de l'école depuis le contexte de sécurité
        School currentSchool = getCurrentSchool();
        LocalDate queryDate = (date == null) ? LocalDate.now() : date;

        return ResponseEntity.ok(cashReceiptService.getDashboardData(filter, queryDate, classroomId, currentSchool.getId()));
    }
}