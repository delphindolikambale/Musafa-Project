package com.school.management.controller.academic;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;
import com.school.management.dto.academic.PendingGradeSheetDTO;
import com.school.management.dto.academic.VisaStatusResponseDTO;
import com.school.management.model.enums.VisaStatus;
import com.school.management.service.academic.GradeSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/assignment/{taId}/matrix")
    public ResponseEntity<ClassGradeSheetResponseDTO> getClassMatrixSheet(@PathVariable Long taId) {
        return ResponseEntity.ok(gradeSheetService.generateClassGradeSheet(taId));
    }

    @PostMapping("/assignment/{taId}/period/{period}/submit")
    public ResponseEntity<String> submitGradeSheetForVisa(@PathVariable Long taId, @PathVariable int period) {
        try {
            gradeSheetService.submitPeriodGradeSheetForVisa(taId, period);
            return ResponseEntity.ok("La fiche de notes a été transmise au Proviseur avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/assignment/{taId}/period/{period}/visa-status")
    public ResponseEntity<VisaStatusResponseDTO> getGradeSheetVisaStatus(@PathVariable Long taId, @PathVariable int period) {
        return ResponseEntity.ok(gradeSheetService.getPeriodGradeSheetVisaStatus(taId, period));
    }

    @GetMapping("/pending-visa/year/{academicYearId}")
    public ResponseEntity<List<PendingGradeSheetDTO>> getPendingGradeSheetsForProviseur(@PathVariable Long academicYearId) {
        return ResponseEntity.ok(gradeSheetService.getPendingGradeSheetsForProviseur(academicYearId));
    }

    // --- Endpoint de Validation par le Proviseur ---
    @PostMapping("/assignment/{taId}/period/{period}/validate")
    public ResponseEntity<String> validateGradeSheet(@PathVariable Long taId, @PathVariable int period) {
        try {
            gradeSheetService.validatePeriodGradeSheet(taId, period);
            return ResponseEntity.ok("La fiche de notes a été validée avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Endpoint de Rejet par le Proviseur avec motif reçu dans le corps JSON ---
    @PostMapping("/assignment/{taId}/period/{period}/reject")
    public ResponseEntity<String> rejectGradeSheet(
            @PathVariable Long taId,
            @PathVariable int period,
            @RequestBody Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : null;
            if (comment == null || comment.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le motif du rejet (champ 'comment') est obligatoire dans le corps de la requête.");
            }
            gradeSheetService.rejectPeriodGradeSheet(taId, period, comment);
            return ResponseEntity.ok("La fiche de notes a été rejetée et renvoyée à l'enseignant.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NOUVEAU : Endpoint de Validation finale par le Titulaire ---
    @PostMapping("/assignment/{taId}/period/{period}/titulaire-validate")
    public ResponseEntity<String> validateByTitulaire(@PathVariable Long taId, @PathVariable int period) {
        try {
            gradeSheetService.validateGradeSheetByTitulaire(taId, period);
            return ResponseEntity.ok("La fiche de notes a été validée au bulletin avec succès par le Titulaire.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NOUVEAU : Endpoint de Signalement d'erreur par le Titulaire ---
    @PostMapping("/assignment/{taId}/period/{period}/titulaire-reject")
    public ResponseEntity<String> rejectByTitulaire(
            @PathVariable Long taId,
            @PathVariable int period,
            @RequestBody Map<String, String> payload) {
        try {
            String comment = payload != null ? payload.get("comment") : null;
            if (comment == null || comment.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le motif de l'erreur (champ 'comment') est obligatoire.");
            }
            gradeSheetService.reportErrorByTitulaire(taId, period, comment);
            return ResponseEntity.ok("L'erreur a été signalée avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}