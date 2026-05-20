package com.school.management.controller.financial;

import com.school.management.dto.financial.StudentPaymentBreakdownResponseDTO;
import com.school.management.service.financial.StudentPaymentBreakdownService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
@CrossOrigin(origins = "*")

public class StudentPaymentBreakdownController {

    private final StudentPaymentBreakdownService breakdownService;

    @Operation(summary = "Récupérer la ventilation analytique complète d'un reçu de paiement")
    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<List<StudentPaymentBreakdownResponseDTO>> getByPaymentId(@PathVariable Long paymentId) {
        List<StudentPaymentBreakdownResponseDTO> response = breakdownService.getByPaymentId(paymentId);
        return response.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
    }
}
