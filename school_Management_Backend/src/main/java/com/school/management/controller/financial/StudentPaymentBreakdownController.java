package com.school.management.controller.financial;

import com.school.management.dto.financial.StudentPaymentBreakdownResponseDTO;
import com.school.management.service.financial.StudentPaymentBreakdownService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur pour la gestion de la ventilation analytique des paiements.
 * Permet de justifier mathématiquement la répartition du paiement pour les parents.
 */
@RestController
@RequestMapping("/api/v1/payment-breakdowns")
@RequiredArgsConstructor
@Tag(name = "Finances: Ventilations", description = "Consultation du détail analytique (Scolarité, Divers, items)")
// ✅ CORRECTION CORS : Remplacement du joker "*" pour s'aligner sur l'usage de serveurs sécurisés avec allowCredentials
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class StudentPaymentBreakdownController {

    private final StudentPaymentBreakdownService breakdownService;

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

    @Operation(summary = "Récupérer la ventilation analytique complète d'un reçu de paiement")
    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<List<StudentPaymentBreakdownResponseDTO>> getByPaymentId(
            @PathVariable Long paymentId) {

        // ✅ Extraction sécurisée du multi-tenant depuis le contexte utilisateur authentifié
        School currentSchool = getCurrentSchool();

        List<StudentPaymentBreakdownResponseDTO> response = breakdownService.getByPaymentId(paymentId, currentSchool.getId());
        return response.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
    }
}