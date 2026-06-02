package com.school.management.controller.academic;

import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.EvaluationCreateDTO;
import com.school.management.dto.academic.EvaluationResponseDTO;
import com.school.management.service.academic.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/save-marks")
    public ResponseEntity<String> saveEvaluation(@RequestBody EvaluationCreateDTO dto) {
        try {
            evaluationService.createEvaluationWithMarks(dto);
            return ResponseEntity.ok("L'évaluation et les notes ont été enregistrées avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/assignment/{taId}/period/{period}")
    public ResponseEntity<List<EvaluationResponseDTO>> getByAssignment(
            @PathVariable Long taId,
            @PathVariable int period) {
        return ResponseEntity.ok(evaluationService.getEvaluationsByAssignment(taId, period));
    }

    @GetMapping("/current-sum/{taId}/{period}")
    public ResponseEntity<Double> getCurrentSum(@PathVariable Long taId, @PathVariable int period) {
        return ResponseEntity.ok(evaluationService.getCurrentPeriodTotalMax(taId, period));
    }

    @GetMapping("/assignment/{taId}/config")
    public ResponseEntity<CourseAssignmentResponseDTO> getAssignmentConfig(@PathVariable Long taId) {
        return ResponseEntity.ok(evaluationService.getCourseConfigByAssignment(taId));
    }
}