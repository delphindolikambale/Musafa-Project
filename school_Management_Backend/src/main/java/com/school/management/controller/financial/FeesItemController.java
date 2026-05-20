package com.school.management.controller.financial;

import com.school.management.dto.financial.FeesItemCreateDTO;
import com.school.management.dto.financial.FeesItemResponseDTO;
import com.school.management.service.financial.FeesItemService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees-items")
@RequiredArgsConstructor
@Tag(name = "Configuration - Fees Items")

public class FeesItemController {

    private final FeesItemService service;

    @PostMapping
    public ResponseEntity<FeesItemResponseDTO> create(@Valid @RequestBody FeesItemCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeesItemResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FeesItemCreateDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FeesItemResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/group/{feesGroupId}")
    public ResponseEntity<List<FeesItemResponseDTO>> getByGroup(@PathVariable Long feesGroupId) {
        return ResponseEntity.ok(service.getByFeesGroup(feesGroupId));
    }
}
