package com.school.management.controller.academic;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.model.academic.Section;
import com.school.management.model.multitenant.School;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT : Import pour l'authentification multi-tenant réelle
import com.school.management.service.academic.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class SectionController {

    private final SectionService sectionService;

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
    public ResponseEntity<Section> create(@RequestBody SectionRequestDTO dto) {
        School currentSchool = getCurrentSchool();
        // ✅ CONSERVATION : Maintien de votre logique métier transmettant l'entité School complète
        return ResponseEntity.status(201).body(sectionService.create(dto, currentSchool));
    }

    @GetMapping
    public ResponseEntity<List<Section>> getAll() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(sectionService.getAll(currentSchool.getId()));
    }

    /**
     * Récupère les sections liées à un niveau spécifique.
     * Note: Si votre base ne lie pas encore Section et Level,
     * cette méthode retourne tout par défaut pour éviter les erreurs 404.
     */
    @GetMapping("/level/{levelId}")
    public ResponseEntity<List<Section>> getByLevel(@PathVariable Long levelId) {
        School currentSchool = getCurrentSchool();
        // Logique adaptée à la RDC : renvoie les sections générales
        // ou filtrées si vous implémentez la relation plus tard.
        return ResponseEntity.ok(sectionService.getAll(currentSchool.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(sectionService.getById(id, currentSchool.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> update(@PathVariable Long id, @RequestBody SectionRequestDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(sectionService.update(id, dto, currentSchool.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        sectionService.delete(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }
}