package com.school.management.controller.academic;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;
import com.school.management.service.academic.LevelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

public class LevelController {
    private final LevelService levelService;

    // ➕ Créer un niveau
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LevelDTO create(@RequestBody @Valid LevelCreateDTO dto) {
        return levelService.create(dto);
    }

    // 📄 Lister tous les niveaux
    @GetMapping
    public List<LevelDTO> getAll() {
        return levelService.getAll();
    }

    // 🔍 Détail d’un niveau
    @GetMapping("/{id}")
    public LevelDTO getById(@PathVariable Long id) {
        return levelService.getById(id);
    }

    // ✏️ Modifier un niveau (Manquait pour le bouton Modifier)
    @PutMapping("/{id}")
    public LevelDTO update(@PathVariable Long id, @RequestBody @Valid LevelCreateDTO dto) {
        return levelService.update(id, dto);
    }

    // 🗑️ Supprimer un niveau (Manquait pour le bouton Supprimer)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        levelService.delete(id);
    }
}
