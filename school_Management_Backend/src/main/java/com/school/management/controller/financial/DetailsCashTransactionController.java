package com.school.management.controller.financial;

import com.school.management.dto.financial.DetailsCashTransactionResponseDTO;
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
@RequestMapping("/api/cash-journal")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class DetailsCashTransactionController {

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

    @GetMapping("/{academicYear}")
    public ResponseEntity<List<DetailsCashTransactionResponseDTO>> getJournal(
            @PathVariable String academicYear) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte de sécurité
        School currentSchool = getCurrentSchool();
        List<DetailsCashTransactionResponseDTO> journal = detailsService.getJournalDetails(academicYear, currentSchool.getId());
        return ResponseEntity.ok(journal);
    }

    @PostMapping("/migrate")
    public ResponseEntity<String> migrateData() {
        // ✅ Extraction sécurisée du multi-tenant via le contexte de sécurité
        School currentSchool = getCurrentSchool();
        detailsService.migrateAll(currentSchool.getId());
        return ResponseEntity.ok("Historique migré et Livre de Caisse mis à jour avec succès.");
    }
}