package com.school.management.controller.financial;

import com.school.management.dto.financial.DailyCashierReportDTO;
import com.school.management.dto.financial.StudentFinancialSummaryDTO;
import com.school.management.dto.financial.StudentPaymentCreateDTO;
import com.school.management.dto.financial.StudentPaymentResponseDTO;
import com.school.management.model.academic.Student;
import com.school.management.service.academic.StudentService;
import com.school.management.service.financial.ReceiptService;
import com.school.management.service.financial.StudentPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student-payments")
@RequiredArgsConstructor
@Tag(name = "Finance - Encaissements", description = "Gestion des paiements élèves et génération de reçus")


public class StudentPaymentController {

    private final StudentPaymentService service;
    private final StudentService studentService;
    private final ReceiptService receiptService; // Ajouté pour la gestion des reçus

    @GetMapping("/daily-report")
    @Operation(summary = "Statistiques journalières pour le dashboard de caisse")
    public ResponseEntity<DailyCashierReportDTO> getDailyReport() {
        return ResponseEntity.ok(service.getDailyReport());
    }

    @GetMapping("/search-students")
    public ResponseEntity<List<Student>> searchEligibleStudents(@RequestParam("q") String q) {
        return ResponseEntity.ok(studentService.searchStudentsWithAccount(q));
    }

    @GetMapping("/summary/{identifier}")
    public ResponseEntity<StudentFinancialSummaryDTO> getAccountSummary(@PathVariable String identifier) {
        return ResponseEntity.ok(service.getAccountSummary(identifier));
    }

    @PostMapping
    public ResponseEntity<StudentPaymentResponseDTO> pay(@Valid @RequestBody StudentPaymentCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.pay(dto));
    }

    @GetMapping
    public ResponseEntity<List<StudentPaymentResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentPaymentResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<StudentPaymentResponseDTO> getByReceiptNumber(@PathVariable String receiptNumber) {
        return ResponseEntity.ok(service.getByReceiptNumber(receiptNumber));
    }

    /**
     * Endpoint pour générer et télécharger le reçu PDF
     */
    @GetMapping("/{id}/print")
    @Operation(summary = "Générer le reçu PDF d'un paiement")
    public ResponseEntity<byte[]> printReceipt(@PathVariable Long id) {
        byte[] pdfContent = receiptService.generateReceiptPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // "inline" permet l'affichage dans le navigateur, "attachment" force le téléchargement
        headers.setContentDisposition(ContentDisposition.inline()
                .filename("Recu_Paiement_" + id + ".pdf")
                .build());

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
}
