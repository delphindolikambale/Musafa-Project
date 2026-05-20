package com.school.management.controller.academic;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.model.academic.Section;
import com.school.management.service.academic.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")

public class SectionController {

    private final SectionService sectionService;

    @PostMapping
    public ResponseEntity<Section> create(@RequestBody SectionRequestDTO dto) {
        return ResponseEntity.status(201).body(sectionService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<Section>> getAll() {
        return ResponseEntity.ok(sectionService.getAll());
    }

    /**
     * Récupère les sections liées à un niveau spécifique.
     * Note: Si votre base ne lie pas encore Section et Level,
     * cette méthode retourne tout par défaut pour éviter les erreurs 404.
     */
    @GetMapping("/level/{levelId}")
    public ResponseEntity<List<Section>> getByLevel(@PathVariable Long levelId) {
        // Logique adaptée à la RDC : renvoie les sections générales
        // ou filtrées si vous implémentez la relation plus tard.
        return ResponseEntity.ok(sectionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> update(@PathVariable Long id, @RequestBody SectionRequestDTO dto) {
        return ResponseEntity.ok(sectionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

