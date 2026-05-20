package com.school.management.controller.academic;
import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.service.academic.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

public class ClassroomController {
    private final ClassroomService classroomService;

    // Modification : On accepte un academicYearId optionnel pour le filtrage des effectifs
    @GetMapping
    public ResponseEntity<List<ClassroomResponseDTO>> getAll(@RequestParam(required = false) Long academicYearId) {
        return ResponseEntity.ok(classroomService.getAll(academicYearId));
    }

    @PostMapping
    public ResponseEntity<ClassroomResponseDTO> create(@Valid @RequestBody ClassroomRequestDTO request) {
        return new ResponseEntity<>(classroomService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassroomResponseDTO> update(@PathVariable Long id, @RequestBody ClassroomRequestDTO dto) {
        return ResponseEntity.ok(classroomService.updateClassroom(id, dto));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        classroomService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classroomService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/level/{levelId}")
    public ResponseEntity<List<ClassroomResponseDTO>> getByLevel(@PathVariable Long levelId, @RequestParam(required = false) Long academicYearId) {
        return ResponseEntity.ok(classroomService.getByLevel(levelId, academicYearId));
    }
}
