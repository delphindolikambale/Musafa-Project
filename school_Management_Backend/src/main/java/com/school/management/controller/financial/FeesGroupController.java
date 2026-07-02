package com.school.management.controller.financial;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.FeesGroupService;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
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
@RequestMapping("/api/v1/fees-groups")
@RequiredArgsConstructor
@Tag(name = "Finance - Groupes de frais")
public class FeesGroupController {

    private final FeesGroupService service;

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

    @PostMapping
    public ResponseEntity<FeesGroupResponseDTO> create(@Valid @RequestBody FeesGroupCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto, currentSchool.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeesGroupResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FeesGroupCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.update(id, dto, currentSchool.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        service.delete(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FeesGroupResponseDTO>> getAll() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getAll(currentSchool.getId()));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<List<FeesGroupResponseDTO>> getByAcademicYear(@PathVariable Long academicYearId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByAcademicYear(academicYearId, currentSchool.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeesGroupResponseDTO> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getById(id, currentSchool.getId()));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        service.deactivate(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }
}