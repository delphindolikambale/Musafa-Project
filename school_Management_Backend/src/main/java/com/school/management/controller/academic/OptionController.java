package com.school.management.controller.academic;

import com.school.management.dto.academic.OptionDTO;
import com.school.management.dto.academic.OptionRequestDTO;
import com.school.management.model.academic.Option;
import com.school.management.service.academic.OptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/options")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")

public class OptionController {

    private final OptionService optionService;

    @PostMapping
    public ResponseEntity<Option> create(@RequestBody OptionRequestDTO dto) {
        return ResponseEntity.ok(optionService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<Option>> getAll() {
        return ResponseEntity.ok(optionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Option> getById(@PathVariable Long id) {
        return ResponseEntity.ok(optionService.getById(id));
    }

    /**
     * Récupère les options liées à une section (ex: Sciences, Informatique)
     */
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<Option>> getBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(optionService.getBySection(sectionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OptionDTO> update(@PathVariable Long id, @RequestBody OptionRequestDTO dto) {
        return ResponseEntity.ok(optionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        optionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
