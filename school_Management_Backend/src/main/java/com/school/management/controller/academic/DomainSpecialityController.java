package com.school.management.controller.academic;

import com.school.management.dto.academic.DomainSpecialityCreateDTO;
import com.school.management.dto.academic.DomainSpecialityResponseDTO;
import com.school.management.service.academic.DomainSpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialities")
@RequiredArgsConstructor

public class DomainSpecialityController {

    private final DomainSpecialityService specialityService;

    @PostMapping
    public ResponseEntity<DomainSpecialityResponseDTO> create(@RequestBody DomainSpecialityCreateDTO dto) {
        return ResponseEntity.ok(specialityService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<DomainSpecialityResponseDTO>> getAll() {
        return ResponseEntity.ok(specialityService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomainSpecialityResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(specialityService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        specialityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
