package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.dto.academic.SubjectValidationStatusDTO;
import com.school.management.dto.academic.TitulaireMonitoringResponseDTO;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.PeriodValidation;
import com.school.management.model.academic.TeacherAssignment;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.PeriodValidationRepository;
import com.school.management.repository.academic.TeacherAssignmentRepository;
import com.school.management.service.academic.TitulaireService;
import com.school.management.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TitulaireServiceImpl implements TitulaireService {

    private final ClassroomRepository classroomRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final PeriodValidationRepository periodValidationRepository;

    /**
     * ✅ EXTRACTION DU CONTEXTE MULTI-TENANT SÉCURISÉ
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("L'utilisateur actuel n'est rattaché à aucun établissement scolaire actif.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    public List<ClassroomResponseDTO> getMyClassrooms(Long teacherId, Long academicYearId) {
        return classroomRepository.findByTitulaireIdAndSchoolId(teacherId, getCurrentSchoolId()).stream()
                .map(this::mapClassroomToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TitulaireMonitoringResponseDTO getMonitoringForClassroomAndPeriod(Long classroomId, int period, Long academicYearId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, getCurrentSchoolId())
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé"));

        List<TeacherAssignment> assignments = teacherAssignmentRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(classroomId, academicYearId, getCurrentSchoolId());

        List<SubjectValidationStatusDTO> subjectStatuses = new ArrayList<>();
        boolean allValidated = true;

        for (TeacherAssignment assignment : assignments) {
            Optional<PeriodValidation> validationOpt = periodValidationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(assignment.getId(), period, getCurrentSchoolId());

            String currentStatus = validationOpt.map(v -> v.getStatus().name()).orElse("DRAFT");

            if (!"VALIDATED_BY_PROVISEUR".equals(currentStatus) && !"VALIDATED_BY_TITULAIRE".equals(currentStatus)) {
                allValidated = false;
            }

            String courseName = "Cours inconnu";
            if (assignment.getCourseAssignment() != null && assignment.getCourseAssignment().getSubject() != null) {
                courseName = assignment.getCourseAssignment().getSubject().getName();
            }

            SubjectValidationStatusDTO statusDTO = SubjectValidationStatusDTO.builder()
                    .teacherAssignmentId(assignment.getId())
                    .subjectName(courseName)
                    .teacherName(assignment.getTeacher() != null ? assignment.getTeacher().getFullName() : "Non assigné")
                    .status(currentStatus)
                    .submissionDate(validationOpt.map(PeriodValidation::getSubmissionDate).orElse(null))
                    .validationDate(validationOpt.map(PeriodValidation::getValidationDate).orElse(null))
                    .build();

            subjectStatuses.add(statusDTO);
        }

        if (assignments.isEmpty()) {
            allValidated = false;
        }

        return TitulaireMonitoringResponseDTO.builder()
                .classroomId(classroom.getId())
                .classroomName(classroom.getDisplayName())
                .period(period)
                .subjects(subjectStatuses)
                .readyForBulletinGeneration(allValidated) // ✅ Builder corrigé avec le nouveau nom
                .hasBulletins(false) // ✅ Ajouté pour s'interfacer avec le Frontend sans erreur
                .build();
    }

    private ClassroomResponseDTO mapClassroomToResponseDTO(Classroom entity) {
        ClassroomResponseDTO dto = new ClassroomResponseDTO();
        dto.setId(entity.getId());
        dto.setDisplayName(entity.getDisplayName());
        dto.setTitulaireId(entity.getTitulaire() != null ? entity.getTitulaire().getId() : null);
        dto.setTitulaireName(entity.getTitulaire() != null ? entity.getTitulaire().getFullName() : null);
        return dto;
    }
}