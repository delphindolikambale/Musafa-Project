package com.school.management.controller.financial;

import com.school.management.dto.financial.DailyCashierReportDTO;
import com.school.management.dto.financial.StudentFinancialSummaryDTO;
import com.school.management.dto.financial.StudentPaymentCreateDTO;
import com.school.management.dto.financial.StudentPaymentResponseDTO;
import com.school.management.model.academic.Student;
import com.school.management.service.academic.StudentService;
import com.school.management.service.financial.ReceiptService;
import com.school.management.service.financial.StudentPaymentService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student-payments")
@RequiredArgsConstructor
@Tag(name = "Finance - Encaissements", description = "Gestion des paiements élèves et génération de reçus")
// ✅ CORRECTION CORS : Remplacement de "*" par la liste explicite de vos serveurs locaux d'origine
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class StudentPaymentController {

    private final StudentPaymentService service;
    private final StudentService studentService;
    private final ReceiptService receiptService;

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

    @GetMapping("/daily-report")
    @Operation(summary = "Statistiques journalières pour le dashboard de caisse")
    public ResponseEntity<DailyCashierReportDTO> getDailyReport() {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getDailyReport(currentSchool.getId()));
    }

    @GetMapping("/search-students")
    public ResponseEntity<List<Student>> searchEligibleStudents(@RequestParam("q") String q) {
        return ResponseEntity.ok(studentService.searchStudentsWithAccount(q));
    }

    @GetMapping("/summary/{identifier}")
    public ResponseEntity<StudentFinancialSummaryDTO> getAccountSummary(
            @PathVariable String identifier) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getAccountSummary(identifier, currentSchool.getId()));
    }

    @PostMapping
    public ResponseEntity<StudentPaymentResponseDTO> pay(
            @Valid @RequestBody StudentPaymentCreateDTO dto) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.pay(dto, currentSchool.getId()));
    }

    @GetMapping
    public ResponseEntity<List<StudentPaymentResponseDTO>> getAll() {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getAll(currentSchool.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentPaymentResponseDTO> getById(
            @PathVariable Long id) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getById(id, currentSchool.getId()));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<StudentPaymentResponseDTO> getByReceiptNumber(
            @PathVariable String receiptNumber) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByReceiptNumber(receiptNumber, currentSchool.getId()));
    }

    /**
     * Endpoint pour générer et télécharger le reçu PDF
     */
    @GetMapping("/{id}/print")
    @Operation(summary = "Générer le reçu PDF d'un paiement")
    public ResponseEntity<byte[]> printReceipt(
            @PathVariable Long id) {
        // ✅ Extraction sécurisée du multi-tenant via le contexte
        School currentSchool = getCurrentSchool();

        // Validation rapide que le paiement appartient au tenant avant impression
        service.getById(id, currentSchool.getId());

        // Génération du reçu PDF avec le paramètre schoolId sécurisé
        byte[] pdfContent = receiptService.generateReceiptPdf(id, currentSchool.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // "inline" permet l'affichage dans le navigateur, "attachment" force le téléchargement
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("Recu_Paiement_" + id + ".pdf")
                .build());

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
}