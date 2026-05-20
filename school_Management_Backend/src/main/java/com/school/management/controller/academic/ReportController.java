package com.school.management.controller.academic;

import com.school.management.dto.academic.ClassroomReportDetailDTO;
import com.school.management.dto.academic.ReportStructureDTO;
import com.school.management.service.academicImpl.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
// Ajout du CrossOrigin pour permettre à React d'accéder à l'API
@CrossOrigin(origins = "http://localhost:3000")

public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Retourne la structure hiérarchique (Dossiers Années > Classes)
     */
    @GetMapping("/structure")
    public ResponseEntity<List<ReportStructureDTO>> getReportStructure() {
        List<ReportStructureDTO> structure = reportService.getReportsFolderStructure();

        if (structure.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(structure);
    }

    /**
     * Retourne les détails complets pour la prévisualisation d'un rapport de classe
     */
    @GetMapping("/classroom-detail/{classroomId}/{yearId}")
    public ResponseEntity<ClassroomReportDetailDTO> getClassroomDetail(
            @PathVariable Long classroomId,
            @PathVariable Long yearId) {
        return ResponseEntity.ok(reportService.getClassroomReportDetail(classroomId, yearId));
    }

}
