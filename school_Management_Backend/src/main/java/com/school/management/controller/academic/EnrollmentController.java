package com.school.management.controller.academic;


import com.school.management.dto.academic.EnrollmentRequestDTO;
import com.school.management.dto.academic.EnrollmentResponseDTO;
import com.school.management.service.academic.EnrollmentService;
import com.school.management.service.academicImpl.EnrollmentServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")


public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<EnrollmentResponseDTO> createEnrollment(@ModelAttribute EnrollmentRequestDTO dto) {
        EnrollmentResponseDTO response = enrollmentService.createEnrollment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ✅ INTELLIGENCE AJOUTÉE :
     * On peut maintenant appeler /api/enrollments?yearId=5
     * pour n'avoir que les données de l'année active.
     */
    @GetMapping
    public ResponseEntity<List<EnrollmentResponseDTO>> getAllEnrollments(
            @RequestParam(value = "yearId", required = false) Long yearId) {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments(yearId));
    }

    @GetMapping("/report/classroom/{classroomId}/academic-year/{academicYearId}")
    public ResponseEntity<List<EnrollmentResponseDTO>> getEnrollmentReport(
            @PathVariable Long classroomId,
            @PathVariable Long academicYearId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByClassroomAndAcademicYear(classroomId, academicYearId));
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<EnrollmentResponseDTO> updateEnrollment(
            @PathVariable Long id,
            @ModelAttribute EnrollmentRequestDTO dto) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable("id") Long id,
            @PathVariable("documentId") Long documentId) {
        enrollmentService.deleteDocument(id, documentId);
        return ResponseEntity.noContent().build();
    }
}
