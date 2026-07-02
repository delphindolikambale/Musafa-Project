package com.school.management.controller.financial;

import com.school.management.dto.financial.*;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import com.school.management.service.financial.StudentFinancialAccountService;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-accounts")
@RequiredArgsConstructor
@Tag(name = "Finance - Profils Annuels", description = "Lien entre un élève et son barème de frais pour une année spécifique")
public class StudentFinancialAccountController {

    private final StudentFinancialAccountService service;
    private final StudentAnnualFinancialProfileService profileService;

    /**
     * Extraction contextuelle de l'école depuis le token d'authentification
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

    @Operation(summary = "Créer le compte financier permanent d'un élève")
    @PostMapping
    public ResponseEntity<StudentFinancialAccountResponseDTO> create(@Valid @RequestBody StudentFinancialAccountCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto, currentSchool.getId()));
    }

    @Operation(summary = "Lister tous les comptes financiers")
    @GetMapping
    public ResponseEntity<List<StudentFinancialAccountListDTO>> getAll() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getAll(currentSchool.getId()));
    }

    @Operation(summary = "Récupérer un compte par son ID technique")
    @GetMapping("/{id}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getById(id, currentSchool.getId()));
    }

    @Operation(summary = "Récupérer les profils annuels (dossiers financiers) liés à un compte")
    @GetMapping("/{id}/profiles")
    public ResponseEntity<List<StudentAnnualFinancialProfileResponseDTO>> getProfilesByAccountId(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        StudentFinancialAccountResponseDTO account = service.getById(id, currentSchool.getId());
        return ResponseEntity.ok(profileService.getByAccountNumber(account.getAccountNumber(), currentSchool.getId()));
    }

    @Operation(summary = "Rechercher un compte par son numéro unique (Matricule)")
    @GetMapping("/by-account-number/{number}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getByAccountNumber(@PathVariable String number) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByAccountNumber(number, currentSchool.getId()));
    }

    @Operation(summary = "Recherche avancée avec détails complets et historique")
    @GetMapping("/details/{accountNumber}")
    public ResponseEntity<StudentFinancialAccountResponseDTO> getFullDetailsByAccountNumber(@PathVariable String accountNumber) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getDetailsByAccountNumber(accountNumber, currentSchool.getId()));
    }

    @Operation(summary = "Rechercher des comptes par nom ou prénom (mot-clé)")
    @GetMapping("/search")
    public ResponseEntity<List<StudentFinancialAccountResponseDTO>> search(@RequestParam String keyword) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.search(keyword, currentSchool.getId()));
    }
}