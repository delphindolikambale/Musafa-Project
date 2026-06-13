package com.school.management.controller.academic;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.service.academic.SubjectService;
import com.school.management.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SubjectController {
    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectResponseDTO>> findAll() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping
    public ResponseEntity<SubjectResponseDTO> create(@RequestBody SubjectRequestDTO dto) {
        return ResponseEntity.ok(subjectService.createSubject(dto));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<SubjectResponseDTO>> getByClass(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {
        return ResponseEntity.ok(subjectService.getSubjectsByClass(levelId, sectionId, optionId, yearId));
    }

    /**
     * ✅ AJOUT : Endpoint dédié pour l'espace élève (/api/academic/subjects/my-courses)
     * Utilise le jeton JWT décodé pour identifier de manière sécurisée l'ID de l'utilisateur connecté
     */
    @GetMapping("/my-courses")
    public ResponseEntity<List<SubjectResponseDTO>> getMyCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(subjectService.getSubjectsForConnectedStudent(userDetails.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponseDTO> update(@PathVariable Long id, @RequestBody SubjectRequestDTO dto) {
        return ResponseEntity.ok(subjectService.updateSubject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }
}