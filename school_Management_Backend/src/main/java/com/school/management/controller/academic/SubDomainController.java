package com.school.management.controller.academic;
import com.school.management.dto.academic.SubDomainRequestDTO;
import com.school.management.dto.academic.SubDomainResponseDTO;
import com.school.management.service.academic.SubDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/academic/sub-domains")
@RequiredArgsConstructor

public class SubDomainController {

    private final SubDomainService subDomainService;

    @GetMapping
    public ResponseEntity<List<SubDomainResponseDTO>> findAll() {
        return ResponseEntity.ok(subDomainService.getAllSubDomains());
    }

    @PostMapping
    public ResponseEntity<SubDomainResponseDTO> create(@RequestBody SubDomainRequestDTO dto) {
        return ResponseEntity.ok(subDomainService.createSubDomain(dto));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<SubDomainResponseDTO>> getByClass(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {
        return ResponseEntity.ok(subDomainService.getSubDomainsByClass(levelId, sectionId, optionId, yearId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubDomainResponseDTO> update(@PathVariable Long id, @RequestBody SubDomainRequestDTO dto) {
        return ResponseEntity.ok(subDomainService.updateSubDomain(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subDomainService.deleteSubDomain(id);
        return ResponseEntity.noContent().build();
    }
}
