package com.school.management.controller.financial;

import com.school.management.dto.financial.CashBookDashboardDTO;
import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.CashTransactionResponseDTO;
import com.school.management.service.financial.CashTransactionService;
import com.school.management.service.financial.DetailsCashTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial/cash-book")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class CashTransactionController {

    private final CashTransactionService service;
    private final DetailsCashTransactionService detailsService;

    @PostMapping("/transaction")
    public ResponseEntity<CashTransactionResponseDTO> record(@RequestBody CashTransactionCreateDTO dto) {
        return ResponseEntity.ok(service.recordTransaction(dto));
    }

    @GetMapping("/livre-recap/{yearId}")
    public ResponseEntity<List<CashTransactionResponseDTO>> getLivre(@PathVariable Long yearId) {
        return ResponseEntity.ok(service.getLivreDeCaisse(yearId));
    }

    @GetMapping("/dashboard/{yearId}")
    public ResponseEntity<CashBookDashboardDTO> getDashboard(@PathVariable Long yearId) {
        return ResponseEntity.ok(service.getDashboardData(yearId));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncJournal() {
        detailsService.migrateAll();
        return ResponseEntity.ok("Synchronisation effectuée avec succès.");
    }
}
