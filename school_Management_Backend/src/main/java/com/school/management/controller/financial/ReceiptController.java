package com.school.management.controller.financial;

import com.school.management.dto.financial.StudentReceiptDTO;
import com.school.management.service.financial.ReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/financial/receipts")
@RequiredArgsConstructor
@Tag(name = "Financial: Reçus", description = "Gestion de la génération des reçus de paiement")


public class ReceiptController {

    private final ReceiptService receiptService;

    @Operation(summary = "Obtenir les données JSON du reçu pour le design Frontend")
    @GetMapping("/{paymentId}/data")
    public ResponseEntity<StudentReceiptDTO> getReceiptData(@PathVariable Long paymentId) {
        return ResponseEntity.ok(receiptService.getReceiptData(paymentId));
    }
}
