package com.school.management.controller.financial;

import com.school.management.dto.financial.FeesItemCreateDTO;
import com.school.management.dto.financial.FeesItemResponseDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.FeesItemService;
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
@RequestMapping("/api/v1/fees-items")
@RequiredArgsConstructor
@Tag(name = "Configuration - Fees Items")
public class FeesItemController {

    private final FeesItemService service;

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
    public ResponseEntity<FeesItemResponseDTO> create(@Valid @RequestBody FeesItemCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto, currentSchool.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeesItemResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FeesItemCreateDTO dto) {
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
    public ResponseEntity<List<FeesItemResponseDTO>> getAll() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getAll(currentSchool.getId()));
    }

    @GetMapping("/group/{feesGroupId}")
    public ResponseEntity<List<FeesItemResponseDTO>> getByGroup(@PathVariable Long feesGroupId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(service.getByFeesGroup(feesGroupId, currentSchool.getId()));
    }
}