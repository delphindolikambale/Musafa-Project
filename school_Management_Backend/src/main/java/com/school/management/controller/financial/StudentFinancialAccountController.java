package com.school.management.controller.financial;

import com.school.management.dto.financial.*;
import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import com.school.management.service.financial.StudentFinancialAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-accounts")
@RequiredArgsConstructor
@Tag(name = "Finance - Profils Annuels", description = "Lien entre un élève et son barème de frais pour une année spécifique")

public class StudentFinancialAccountController {

    private final StudentFinancialAccountService service;
    private final StudentAnnualFinancialProfileService profileService;

    @Operation(summary = "Créer le compte financier permanent d'un élève")
    @PostMapping
    public ResponseEntity<StudentFinancialAccountResponseDTO> create(@Valid @RequestBody StudentFinancialAccountCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @Operation(summary = "Lister tous les comptes financiers")
    @GetMapping
    public ResponseEntity<List<StudentFinancialAccountListDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Récupérer un compte par son ID technique")
    @GetMapping("/{id}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Récupérer les profils annuels (dossiers financiers) liés à un compte")
    @GetMapping("/{id}/profiles")
    public ResponseEntity<List<StudentAnnualFinancialProfileResponseDTO>> getProfilesByAccountId(@PathVariable Long id) {
        StudentFinancialAccountResponseDTO account = service.getById(id);
        return ResponseEntity.ok(profileService.getByAccountNumber(account.getAccountNumber()));
    }

    @Operation(summary = "Rechercher un compte par son numéro unique (Matricule)")
    @GetMapping("/by-account-number/{number}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getByAccountNumber(@PathVariable String number) {
        return ResponseEntity.ok(service.getByAccountNumber(number));
    }

    @Operation(summary = "Recherche avancée avec détails complets et historique")
    @GetMapping("/details/{accountNumber}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getFullDetailsByAccountNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(service.getDetailsByAccountNumber(accountNumber));
    }

    @Operation(summary = "Rechercher des comptes par nom ou prénom (mot-clé)")
    @GetMapping("/search")
    public ResponseEntity<List<StudentFinancialAccountResponseDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.search(keyword));
    }
}
