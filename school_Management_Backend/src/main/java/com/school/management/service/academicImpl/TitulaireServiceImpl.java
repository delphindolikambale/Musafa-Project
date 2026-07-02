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
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT

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
        // ✅ CORRECTION MULTI-TENANT : Passage du schoolId pour correspondre à la signature du ClassroomRepository
        return classroomRepository.findByTitulaireIdAndSchoolId(teacherId, getCurrentSchoolId()).stream()
                .map(this::mapClassroomToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TitulaireMonitoringResponseDTO getMonitoringForClassroomAndPeriod(Long classroomId, int period, Long academicYearId) {
        // ✅ CORRECTION MULTI-TENANT : Utilisation du findById sécurisé par école active
        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, getCurrentSchoolId())
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé"));

        // 1. Récupérer toutes les affectations de cours pour cette classe et cette année
        // ✅ CORRECTION MULTI-TENANT : Utilisation de la méthode filtrée par schoolId du TeacherAssignmentRepository
        List<TeacherAssignment> assignments = teacherAssignmentRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(classroomId, academicYearId, getCurrentSchoolId());

        List<SubjectValidationStatusDTO> subjectStatuses = new ArrayList<>();
        boolean allValidated = true;

        // 2. Pour chaque cours, chercher le statut de validation de la période
        for (TeacherAssignment assignment : assignments) {
            // ✅ CORRECTION MULTI-TENANT : Utilisation de la méthode filtrée par schoolId du PeriodValidationRepository
            Optional<PeriodValidation> validationOpt = periodValidationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(assignment.getId(), period, getCurrentSchoolId());

            String currentStatus = validationOpt.map(v -> v.getStatus().name()).orElse("DRAFT");

            // Si au moins un cours n'est pas validé par le proviseur, le bulletin n'est pas prêt
            if (!"VALIDATED_BY_PROVISEUR".equals(currentStatus) && !"VALIDATED_BY_TITULAIRE".equals(currentStatus)) {
                allValidated = false;
            }

            // MAPPING PROPRE : On passe par CourseAssignment puis Subject pour éviter l'erreur de compilation
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

        // Si la classe n'a aucun cours assigné, elle ne peut pas être prête
        if (assignments.isEmpty()) {
            allValidated = false;
        }

        return TitulaireMonitoringResponseDTO.builder()
                .classroomId(classroom.getId())
                .classroomName(classroom.getDisplayName())
                .period(period)
                .subjects(subjectStatuses)
                .isReadyForBulletinGeneration(allValidated)
                .build();
    }

    // Méthode utilitaire simple pour mapper la classe
    private ClassroomResponseDTO mapClassroomToResponseDTO(Classroom entity) {
        ClassroomResponseDTO dto = new ClassroomResponseDTO();
        dto.setId(entity.getId());
        dto.setDisplayName(entity.getDisplayName());
        dto.setTitulaireId(entity.getTitulaire() != null ? entity.getTitulaire().getId() : null);
        dto.setTitulaireName(entity.getTitulaire() != null ? entity.getTitulaire().getFullName() : null);
        return dto;
    }
}