package com.school.management.controller.academic;

import com.school.management.dto.academic.StudentMarkDTO;
import com.school.management.service.academic.StudentMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marks")
@RequiredArgsConstructor

public class StudentMarkController {

    private final StudentMarkService markService;

    @PutMapping("/{id}")
    public ResponseEntity<String> updateMark(@PathVariable Long id, @RequestParam double value) {
        try {
            markService.updateStudentMark(id, value);
            return ResponseEntity.ok("Note mise à jour");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // AJOUT ADAPTÉ : Permet au Frontend (EvaluationService.js -> getMarksByEvaluationTask) de charger les notes
    @GetMapping("/evaluation/{evaluationTaskId}")
    public ResponseEntity<List<StudentMarkDTO>> getMarksByEvaluation(@PathVariable Long evaluationTaskId) {
        return ResponseEntity.ok(markService.getMarksByEvaluation(evaluationTaskId));
    }
}
