package com.school.management.controller.financial;

import com.school.management.dto.financial.InstallmentSchedulePaymentResponseDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.InstallmentSchedulePaymentService;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/installment-schedule-payments")
@RequiredArgsConstructor
@Tag(name = "Finance - Paiements par tranche", description = "Consultation de la répartition des paiements sur les échéances (tranches)")
@CrossOrigin(origins = "*")
public class InstallmentSchedulePaymentController {

    private final InstallmentSchedulePaymentService service;

    /**
     * Extraction sécurisée du contexte d'établissement actif (JWT)
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

    @Operation(summary = "Lister toutes les lignes d'affectation aux tranches")
    @GetMapping
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getAll() {
        School currentSchool = getCurrentSchool();
        List<InstallmentSchedulePaymentResponseDTO> response = service.getAll(currentSchool.getId());
        return response.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
    }

    @Operation(summary = "Obtenir le détail d'une affectation spécifique par son ID")
    @GetMapping("/{id}")
    public ResponseEntity<InstallmentSchedulePaymentResponseDTO> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getById(id, currentSchool.getId()));
    }

    @Operation(summary = "Voir la distribution d'un reçu (Paiement) sur les différentes tranches")
    @GetMapping("/student-payment/{studentPaymentId}")
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getByStudentPayment(
            @PathVariable Long studentPaymentId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByStudentPayment(studentPaymentId, currentSchool.getId()));
    }

    @Operation(summary = "Lister l'historique de tous les versements ayant contribué à une tranche spécifique")
    @GetMapping("/installment/{installmentScheduleId}")
    public ResponseEntity<List<InstallmentSchedulePaymentResponseDTO>> getByInstallment(
            @PathVariable Long installmentScheduleId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByInstallmentSchedule(installmentScheduleId, currentSchool.getId()));
    }
}