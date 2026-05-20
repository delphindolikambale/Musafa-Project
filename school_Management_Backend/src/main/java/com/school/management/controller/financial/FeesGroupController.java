package com.school.management.controller.financial;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;
import com.school.management.service.financial.FeesGroupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees-groups")
@RequiredArgsConstructor
@Tag(name = "Finance - Groupes de frais")

public class FeesGroupController {

    private final FeesGroupService service;

    @PostMapping
    public ResponseEntity<FeesGroupResponseDTO> create(@Valid @RequestBody FeesGroupCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeesGroupResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FeesGroupCreateDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FeesGroupResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<List<FeesGroupResponseDTO>> getByAcademicYear(@PathVariable Long academicYearId) {
        return ResponseEntity.ok(service.getByAcademicYear(academicYearId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeesGroupResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
