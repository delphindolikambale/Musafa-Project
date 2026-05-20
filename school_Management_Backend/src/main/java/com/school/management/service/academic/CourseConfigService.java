package com.school.management.service.academic;
import com.school.management.dto.academic.CourseAssignmentRequestDTO;
import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.ImportConfigRequestDTO;
import com.school.management.model.academic.CourseAssignment;
import java.util.List;

public interface CourseConfigService {
    CourseAssignment configureCourse(CourseAssignmentRequestDTO dto);

    List<CourseAssignmentResponseDTO> getPedagogicalConfiguration(Long levelId, Long sectionId, Long optionId, Long yearId);

    CourseAssignment updateCourseConfig(Long id, CourseAssignmentRequestDTO dto);

    void deleteCourseConfig(Long id);

    /**
     * Importe toute la structure (Domaines, Sous-Domaines, Cours et Maxima)
     * depuis une année source vers une année cible.
     */
    void importConfigurationFromPreviousYear(ImportConfigRequestDTO dto);
}
