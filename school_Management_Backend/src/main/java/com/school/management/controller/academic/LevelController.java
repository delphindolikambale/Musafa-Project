package com.school.management.controller.academic;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.academic.LevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LevelController {
    private final LevelService levelService;

    /**
     * Méthode d'extraction du contexte de l'école active à partir de l'utilisateur authentifié (JWT).
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AcademicYearController.SchoolContextDetails) {
                return ((AcademicYearController.SchoolContextDetails) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    // ➕ Créer un niveau
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LevelDTO create(@RequestBody @Valid LevelCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return levelService.create(dto, currentSchool.getId());
    }

    // 📄 Lister tous les niveaux
    @GetMapping
    public List<LevelDTO> getAll() {
        School currentSchool = getCurrentSchool();
        return levelService.getAll(currentSchool.getId());
    }

    // 🔍 Détail d’un niveau
    @GetMapping("/{id}")
    public LevelDTO getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return levelService.getById(id, currentSchool.getId());
    }

    // ✏️ Modifier un niveau (Manquait pour le bouton Modifier)
    @PutMapping("/{id}")
    public LevelDTO update(@PathVariable Long id, @RequestBody @Valid LevelCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return levelService.update(id, dto, currentSchool.getId());
    }

    // 🗑️ Supprimer un niveau (Manquait pour le bouton Supprimer)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        levelService.delete(id, currentSchool.getId());
    }
}