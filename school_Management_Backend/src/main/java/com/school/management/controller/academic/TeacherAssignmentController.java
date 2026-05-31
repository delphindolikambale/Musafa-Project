package com.school.management.controller.academic;

import com.school.management.dto.academic.TeacherAssignmentRequestDTO;
import com.school.management.dto.academic.TeacherAssignmentResponseDTO;
import com.school.management.service.academic.TeacherAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher-assignments")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private final TeacherAssignmentService service;

    @PostMapping
    public ResponseEntity<TeacherAssignmentResponseDTO> create(@RequestBody TeacherAssignmentRequestDTO dto) {
        return ResponseEntity.ok(service.assignTeacher(dto));
    }

    @PostMapping("/import-previous-year")
    public ResponseEntity<Void> importFromPreviousYear(@RequestBody Map<String, Long> payload) {
        Long sourceYearId = payload.get("sourceYearId");
        Long targetYearId = payload.get("targetYearId");
        service.importAssignmentsFromPreviousYear(sourceYearId, targetYearId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherAssignmentResponseDTO> update(
            @PathVariable Long id,
            @RequestBody TeacherAssignmentRequestDTO dto) {
        return ResponseEntity.ok(service.updateAssignment(id, dto));
    }

    @GetMapping("/class/{classroomId}/{yearId}")
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getByClass(
            @PathVariable Long classroomId, @PathVariable Long yearId) {
        return ResponseEntity.ok(service.getAssignmentsByClass(classroomId, yearId));
    }

    @GetMapping("/teacher/{teacherId}/{yearId}")
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getByTeacher(
            @PathVariable Long teacherId, @PathVariable Long yearId) {
        return ResponseEntity.ok(service.getAssignmentsByTeacher(teacherId, yearId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherAssignmentResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAssignmentById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    // NOUVEAU ENDPOINT : Récupération du taux de réussite d'un cours spécifique
    @GetMapping("/success-rate/{assignmentId}")
    public ResponseEntity<Double> getCourseSuccessRate(@PathVariable Long assignmentId) {
        // Le type de retour est maintenant aligné avec le Service (Double)
        return ResponseEntity.ok(service.getCourseSuccessRate(assignmentId));
    }
}