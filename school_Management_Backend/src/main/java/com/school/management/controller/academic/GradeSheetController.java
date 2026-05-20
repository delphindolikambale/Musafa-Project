package com.school.management.controller.academic;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;
import com.school.management.service.academic.GradeSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/grade-sheets")
@RequiredArgsConstructor

public class GradeSheetController {

    private final GradeSheetService gradeSheetService;

    @GetMapping("/student/{studentId}/year/{yearId}")
    public ResponseEntity<GradeSheetResponseDTO> getStudentSheet(
            @PathVariable Long studentId,
            @PathVariable Long yearId,
            @RequestParam(defaultValue = "1") int semester) {
        return ResponseEntity.ok(gradeSheetService.generateStudentGradeSheet(studentId, yearId, semester));
    }

    // --- NOUVEAU : Endpoint pour la Fiche de Cotes de toute la classe ---
    @GetMapping("/assignment/{taId}/matrix")
    public ResponseEntity<ClassGradeSheetResponseDTO> getClassMatrixSheet(@PathVariable Long taId) {
        return ResponseEntity.ok(gradeSheetService.generateClassGradeSheet(taId));
    }
}
