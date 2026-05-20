package com.school.management.controller.academic;
import com.school.management.dto.academic.DomainRequestDTO;
import com.school.management.dto.academic.DomainResponseDTO;
import com.school.management.service.academic.DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/academic/domains")
@RequiredArgsConstructor

public class DomainController {
    private final DomainService domainService;

    // AJOUT : Pour répondre à getAllDomains() du frontend
    @GetMapping
    public ResponseEntity<List<DomainResponseDTO>> findAll() {
        // Supposons que vous ayez cette méthode dans votre service
        return ResponseEntity.ok(domainService.getAllDomains());
    }

    @PostMapping
    public ResponseEntity<DomainResponseDTO> create(@RequestBody DomainRequestDTO dto) {
        return ResponseEntity.ok(domainService.createDomain(dto));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<DomainResponseDTO>> getByClass(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {
        return ResponseEntity.ok(domainService.getDomainsByClass(levelId, sectionId, optionId, yearId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DomainResponseDTO> update(@PathVariable Long id, @RequestBody DomainRequestDTO dto) {
        return ResponseEntity.ok(domainService.updateDomain(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        domainService.deleteDomain(id);
        return ResponseEntity.noContent().build();
    }
}
