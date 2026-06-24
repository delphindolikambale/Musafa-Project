package com.school.management.controller.academic;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.dto.academic.GridSubjectRequestDTO;
import com.school.management.service.academic.SubjectService;
import com.school.management.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SubjectController {

    private final SubjectService subjectService;

    // ✅ GESTIONNAIRES D'EXCEPTIONS AJOUTÉS
    // Intercepte les erreurs @Valid (ex: @NotNull sur l'année) et les formate proprement pour le frontend
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        String errorMessage = "Erreur de validation";
        if (ex.getBindingResult().hasErrors()) {
            errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        }
        errors.put("message", errorMessage);
        return ResponseEntity.badRequest().body(errors);
    }

    // Intercepte les erreurs personnalisées du Service
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(errors);
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponseDTO>> findAll() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping
    public ResponseEntity<SubjectResponseDTO> create(@RequestBody SubjectRequestDTO dto) {
        return ResponseEntity.ok(subjectService.createSubject(dto));
    }

    /**
     * ✅ ENDPOINT DE SAUVEGARDE MATRICIELLE EN MASSE
     */
    @PostMapping("/bulk-grid")
    public ResponseEntity<Void> saveBulkGrid(@Valid @RequestBody GridSubjectRequestDTO dto) {
        subjectService.saveBulkGrid(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<SubjectResponseDTO>> getByClass(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {
        return ResponseEntity.ok(subjectService.getSubjectsByClass(levelId, sectionId, optionId, yearId));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<SubjectResponseDTO>> getMyCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(subjectService.getSubjectsForConnectedStudent(userDetails.getId()));
    }

    /**
     * ✅ ENDPOINT DE RECHERCHE POUR LE MODAL DES MAXIMA
     * Renvoie la liste restrictive des matières déjà configurées dans la grille horaire de la classe
     */
    @GetMapping("/lookup-by-class")
    public ResponseEntity<List<SubjectResponseDTO>> getSubjectsLookupForMaxima(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {
        return ResponseEntity.ok(subjectService.getSubjectsByClass(levelId, sectionId, optionId, yearId));
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