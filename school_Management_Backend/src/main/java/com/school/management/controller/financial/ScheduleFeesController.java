package com.school.management.controller.financial;

import com.school.management.dto.financial.ScheduleFeesDTO;
import com.school.management.dto.financial.ScheduleFeesResponseDTO;
import com.school.management.service.financial.ScheduleFeesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule-fees")
@RequiredArgsConstructor
@Tag(name = "Configuration - Frais scolaires")

public class ScheduleFeesController {
    private final ScheduleFeesService service;

    @Operation(summary = "Créer un nouveau barème de frais")
    @PostMapping
    public ResponseEntity<ScheduleFeesResponseDTO> create(@Valid @RequestBody ScheduleFeesDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @Operation(summary = "Modifier un barème (Propage automatiquement les changements aux dossiers élèves)")
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleFeesResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ScheduleFeesDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Operation(summary = "Supprimer définitivement un barème")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Récupère les barèmes de l'année active uniquement")
    @GetMapping
    public ResponseEntity<List<ScheduleFeesResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Lister les barèmes pour une année académique spécifique")
    @GetMapping("/academic-year/{yearId}")
    public ResponseEntity<List<ScheduleFeesResponseDTO>> getByAcademicYear(@PathVariable Long yearId) {
        return ResponseEntity.ok(service.getByAcademicYear(yearId));
    }

    @Operation(summary = "Obtenir les détails d'un barème par son ID")
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleFeesResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Désactiver un barème sans le supprimer")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}