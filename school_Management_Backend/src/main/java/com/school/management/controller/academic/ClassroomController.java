package com.school.management.controller.academic;

import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.academic.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ClassroomController {

    private final ClassroomService classroomService;

    /**
     * Méthode d'extraction du contexte de l'école active à partir de l'utilisateur authentifié (JWT).
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AcademicYearController.SchoolContextDetails) {
                return ((AcademicYearController.SchoolContextDetails) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponseDTO>> getAll(@RequestParam(required = false) Long academicYearId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(classroomService.getAll(academicYearId, currentSchool.getId()));
    }

    // NOUVEL ENDPOINT : Récupération d'une classe spécifique par son ID (Règle le problème 405 Method Not Allowed)
    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponseDTO> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(classroomService.getById(id, currentSchool.getId()));
    }

    @PostMapping
    public ResponseEntity<ClassroomResponseDTO> create(@Valid @RequestBody ClassroomRequestDTO request) {
        School currentSchool = getCurrentSchool();
        return new ResponseEntity<>(classroomService.create(request, currentSchool.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassroomResponseDTO> update(@PathVariable Long id, @RequestBody ClassroomRequestDTO dto) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(classroomService.updateClassroom(id, dto, currentSchool.getId()));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        classroomService.toggleStatus(id, currentSchool.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        classroomService.delete(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/level/{levelId}")
    public ResponseEntity<List<ClassroomResponseDTO>> getByLevel(@PathVariable Long levelId, @RequestParam(required = false) Long academicYearId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(classroomService.getByLevel(levelId, academicYearId, currentSchool.getId()));
    }

    // NOUVEL ENDPOINT : Assigner un titulaire
    @PutMapping("/{classroomId}/assign-titulaire/{teacherId}")
    public ResponseEntity<Void> assignTitulaire(
            @PathVariable Long classroomId,
            @PathVariable Long teacherId) {
        School currentSchool = getCurrentSchool();
        classroomService.assignTitulaire(classroomId, teacherId, currentSchool.getId());
        return ResponseEntity.ok().build();
    }

    // NOUVEL ENDPOINT : Retirer un titulaire
    @DeleteMapping("/{classroomId}/remove-titulaire")
    public ResponseEntity<Void> removeTitulaire(@PathVariable Long classroomId) {
        School currentSchool = getCurrentSchool();
        classroomService.removeTitulaire(classroomId, currentSchool.getId());
        return ResponseEntity.ok().build();
    }
}