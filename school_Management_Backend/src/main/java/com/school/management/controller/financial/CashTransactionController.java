package com.school.management.controller.financial;

import com.school.management.dto.financial.CashBookDashboardDTO;
import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.CashTransactionResponseDTO;
import com.school.management.service.financial.CashTransactionService;
import com.school.management.service.financial.DetailsCashTransactionService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial/cash-book")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class CashTransactionController {

    private final CashTransactionService service;
    private final DetailsCashTransactionService detailsService;

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

    @PostMapping("/transaction")
    public ResponseEntity<CashTransactionResponseDTO> record(
            @RequestBody CashTransactionCreateDTO dto) {
        // ✅ Extraction sécurisée du multi-tenant
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.recordTransaction(dto, currentSchool.getId()));
    }

    @GetMapping("/livre-recap/{yearId}")
    public ResponseEntity<List<CashTransactionResponseDTO>> getLivre(
            @PathVariable Long yearId) {
        // ✅ Extraction sécurisée du multi-tenant
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getLivreDeCaisse(yearId, currentSchool.getId()));
    }

    @GetMapping("/dashboard/{yearId}")
    public ResponseEntity<CashBookDashboardDTO> getDashboard(
            @PathVariable Long yearId) {
        // ✅ Extraction sécurisée du multi-tenant
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getDashboardData(yearId, currentSchool.getId()));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncJournal() {
        // ✅ Extraction sécurisée du multi-tenant
        School currentSchool = getCurrentSchool();
        detailsService.migrateAll(currentSchool.getId());
        return ResponseEntity.ok("Synchronisation effectuée avec succès.");
    }
}