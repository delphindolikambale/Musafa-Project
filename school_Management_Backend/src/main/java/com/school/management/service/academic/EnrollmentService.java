package com.school.management.service.academic;

import com.school.management.dto.academic.EnrollmentRequestDTO;
import com.school.management.dto.academic.EnrollmentResponseDTO;
import com.school.management.model.academic.Enrollment;

import java.util.List;

public interface EnrollmentService {

    List<EnrollmentResponseDTO> getAllEnrollments(Long academicYearId);

    EnrollmentResponseDTO createEnrollment(EnrollmentRequestDTO dto);
    List<EnrollmentResponseDTO> getEnrollmentsByClassroomAndAcademicYear(Long classroomId, Long academicYearId);
    void deleteEnrollment(Long id);
    EnrollmentResponseDTO updateEnrollment(Long id, EnrollmentRequestDTO dto);
    void deleteDocument(Long enrollmentId, Long documentId);
}
