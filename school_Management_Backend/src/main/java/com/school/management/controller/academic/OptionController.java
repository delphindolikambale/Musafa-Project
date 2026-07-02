package com.school.management.controller.academic;

import com.school.management.dto.academic.OptionDTO;
import com.school.management.dto.academic.OptionRequestDTO;
import com.school.management.model.academic.Option;
import com.school.management.model.multitenant.School;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT : Import pour l'authentification multi-tenant réelle
import com.school.management.service.academic.OptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/options")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class OptionController {

    private final OptionService optionService;

    /**
     * Méthode d'extraction du contexte de l'école active à partir de l'utilisateur authentifié (JWT).
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();

            // ✅ CORRECTION : Utilisation directe de UserDetailsImpl au lieu de l'interface non implémentée
            if (principal instanceof UserDetailsImpl) {
                return ((UserDetailsImpl) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @PostMapping
    public ResponseEntity<Option> create(@RequestBody OptionRequestDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(optionService.create(dto, currentSchool.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Option>> getAll() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(optionService.getAll(currentSchool.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Option> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(optionService.getById(id, currentSchool.getId()));
    }

    /**
     * Récupère les options liées à une section (ex: Sciences, Informatique)
     */
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<Option>> getBySection(@PathVariable Long sectionId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(optionService.getBySection(sectionId, currentSchool.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OptionDTO> update(@PathVariable Long id, @RequestBody OptionRequestDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(optionService.update(id, dto, currentSchool.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        optionService.delete(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }
}