package com.school.management.controller.financial;

import com.school.management.dto.financial.ScheduleFeesDTO;
import com.school.management.dto.financial.ScheduleFeesResponseDTO;
import com.school.management.model.auth.User;
import com.school.management.repository.auth.UserRepository;
import com.school.management.service.financial.ScheduleFeesService;
import com.school.management.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule-fees")
@RequiredArgsConstructor
@Tag(name = "Configuration - Frais scolaires")
public class ScheduleFeesController {

    private final ScheduleFeesService service;
    private final UserRepository userRepository;

    @Operation(summary = "Créer un nouveau barème de frais")
    @PostMapping
    public ResponseEntity<ScheduleFeesResponseDTO> create(@Valid @RequestBody ScheduleFeesDTO dto, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(service.create(dto, schoolId));
    }

    @Operation(summary = "Modifier un barème (Propage automatiquement les changements aux dossiers élèves)")
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleFeesResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ScheduleFeesDTO dto, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(service.update(id, dto, schoolId));
    }

    @Operation(summary = "Supprimer définitivement un barème")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        service.delete(id, schoolId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Récupère les barèmes de l'année active uniquement")
    @GetMapping
    public ResponseEntity<List<ScheduleFeesResponseDTO>> getAll(Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(service.getAll(schoolId));
    }

    @Operation(summary = "Lister les barèmes pour une année académique spécifique")
    @GetMapping("/academic-year/{yearId}")
    public ResponseEntity<List<ScheduleFeesResponseDTO>> getByAcademicYear(@PathVariable Long yearId, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(service.getByAcademicYear(yearId, schoolId));
    }

    @Operation(summary = "Obtenir les détails d'un barème par son ID")
    @GetMapping("/{id}")
    public ResponseEntity<ScheduleFeesResponseDTO> getById(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(service.getById(id, schoolId));
    }

    @Operation(summary = "Désactiver un barème sans le supprimer")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        service.deactivate(id, schoolId);
        return ResponseEntity.noContent().build();
    }

    private Long getSchoolIdFromAuthentication(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
        return user.getSchool().getId();
    }
}