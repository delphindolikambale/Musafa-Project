package com.school.management.controller.financial;

import com.school.management.dto.financial.DetailsCashTransactionResponseDTO;
import com.school.management.service.financial.DetailsCashTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cash-journal")
@RequiredArgsConstructor

public class DetailsCashTransactionController {

    private final DetailsCashTransactionService detailsService;

    @GetMapping("/{academicYear}")
    public ResponseEntity<List<DetailsCashTransactionResponseDTO>> getJournal(@PathVariable String academicYear) {
        List<DetailsCashTransactionResponseDTO> journal = detailsService.getJournalDetails(academicYear);
        return ResponseEntity.ok(journal);
    }

    @PostMapping("/migrate")
    public ResponseEntity<String> migrateData() {
        detailsService.migrateAll();
        return ResponseEntity.ok("Historique migré et Livre de Caisse mis à jour avec succès.");
    }
}
