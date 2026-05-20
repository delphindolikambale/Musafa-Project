package com.school.management.controller.financial;

import com.school.management.dto.financial.InstallmentSchedulePaymentResponseDTO;
import com.school.management.service.financial.InstallmentSchedulePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/installment-schedule-payments") // Ajout de v1 pour le versioning
@RequiredArgsConstructor
@Tag(name = "Finance - Paiements par tranche", description = "Consultation de la répartition des paiements sur les échéances (tranches)")
@CrossOrigin(origins = "*") // Important pour vos futurs tests Frontend

public class InstallmentSchedulePaymentController {

    private final InstallmentSchedulePaymentService service;

    @Operation(summary = "Lister toutes les lignes d'affectation aux tranches")
    @GetMapping
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getAll() {
        List<InstallmentSchedulePaymentResponseDTO> response = service.getAll();
        return response.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
    }

    @Operation(summary = "Obtenir le détail d'une affectation spécifique par son ID")
    @GetMapping("/{id}")
    public ResponseEntity<InstallmentSchedulePaymentResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Voir la distribution d'un reçu (Paiement) sur les différentes tranches")
    @GetMapping("/student-payment/{studentPaymentId}")
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getByStudentPayment(
            @PathVariable Long studentPaymentId) {
        return ResponseEntity.ok(service.getByStudentPayment(studentPaymentId));
    }

    @Operation(summary = "Lister l'historique de tous les versements ayant contribué à une tranche spécifique")
    @GetMapping("/installment/{installmentScheduleId}")
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getByInstallment(
            @PathVariable Long installmentScheduleId) {
        return ResponseEntity.ok(service.getByInstallmentSchedule(installmentScheduleId));
    }
}
