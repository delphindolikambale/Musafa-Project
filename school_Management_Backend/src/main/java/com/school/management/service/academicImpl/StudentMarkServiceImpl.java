package com.school.management.service.academicImpl;

import com.school.management.dto.academic.StudentMarkDTO;
import com.school.management.model.academic.PeriodValidation;
import com.school.management.model.academic.StudentMark;
import com.school.management.model.enums.VisaStatus;
import com.school.management.repository.academic.PeriodValidationRepository;
import com.school.management.repository.academic.StudentMarkRepository;
import com.school.management.service.academic.StudentMarkService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentMarkServiceImpl implements StudentMarkService {

    private final StudentMarkRepository markRepository;
    private final PeriodValidationRepository validationRepository;

    /**
     * ✅ EXTRACTION DES COMPTES PAR TENANT CONNECTÉ
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
            throw new IllegalStateException("L'utilisateur actuel n'est rattaché à aucun établissement scolaire active.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public void updateStudentMark(Long markId, double newValue) {
        StudentMark mark = markRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée"));

        // ✅ BARRIÈRE CRITIQUE SÉCURITÉ MULTI-TENANT
        if (!mark.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Modification non autorisée : Cette note provient d'un autre établissement.");
        }

        // SECURITE : Vérifier si la Fiche de notes de la période est déjà soumise
        int period = mark.getEvaluationTask().getPeriod();
        Long taId = mark.getEvaluationTask().getTeacherAssignment().getId();

        // ✅ CORRECTION MULTI-TENANT : Passage du schoolId pour correspondre à la signature du Repository
        Optional<PeriodValidation> validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, getCurrentSchoolId());
        if (validation.isPresent() && validation.get().getStatus() != VisaStatus.DRAFT) {
            throw new RuntimeException("Modification impossible : La Fiche de notes de cette période est déjà verrouillée et soumise au Proviseur.");
        }

        // Vérification par rapport au maxima de l'évaluation parente
        if (newValue > mark.getEvaluationTask().getMaxPoints()) {
            throw new RuntimeException("La note ne peut pas dépasser le maxima de " + mark.getEvaluationTask().getMaxPoints());
        }

        mark.setObtainedValue(newValue);
        markRepository.save(mark);
    }

    @Override
    public List<StudentMarkDTO> getMarksByEvaluation(Long evaluationTaskId) {
        // ✅ PROTECTION DU FLUX LECTURE SUR LE PERIMÈTRE DE L'ÉCOLE ACTIVE
        return markRepository.findByEvaluationTaskIdAndSchoolId(evaluationTaskId, getCurrentSchoolId()).stream()
                .map(m -> {
                    StudentMarkDTO dto = new StudentMarkDTO();
                    dto.setStudentId(m.getStudent().getId());
                    dto.setObtainedValue(m.getObtainedValue());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public List<StudentMarkDTO> getStudentMarksForAssignment(Long studentId, Long taId) {
        // ✅ PROTECTION DU FLUX LECTURE SUR LE PERIMÈTRE DE L'ÉCOLE ACTIVE
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentIdAndSchoolId(studentId, taId, getCurrentSchoolId()).stream()
                .map(m -> {
                    StudentMarkDTO dto = new StudentMarkDTO();
                    dto.setStudentId(m.getStudent().getId());
                    dto.setObtainedValue(m.getObtainedValue());
                    return dto;
                }).collect(Collectors.toList());
    }
}