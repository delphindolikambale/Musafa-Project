package com.school.management.service.academicImpl;

import com.school.management.dto.academic.StudentMarkDTO;
import com.school.management.model.academic.PeriodValidation;
import com.school.management.model.academic.StudentMark;
import com.school.management.model.enums.VisaStatus;
import com.school.management.repository.academic.PeriodValidationRepository;
import com.school.management.repository.academic.StudentMarkRepository;
import com.school.management.service.academic.StudentMarkService;
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
    private final PeriodValidationRepository validationRepository; // AJOUT : Nécessaire pour vérifier la sécurité

    @Override
    @Transactional
    public void updateStudentMark(Long markId, double newValue) {
        StudentMark mark = markRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée"));

        // SECURITE : Vérifier si la Fiche de notes de la période est déjà soumise
        int period = mark.getEvaluationTask().getPeriod();
        Long taId = mark.getEvaluationTask().getTeacherAssignment().getId();

        Optional<PeriodValidation> validation = validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period);
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
        return markRepository.findByEvaluationTaskId(evaluationTaskId).stream()
                .map(m -> {
                    StudentMarkDTO dto = new StudentMarkDTO();
                    dto.setStudentId(m.getStudent().getId());
                    dto.setObtainedValue(m.getObtainedValue());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public List<StudentMarkDTO> getStudentMarksForAssignment(Long studentId, Long taId) {
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, taId).stream()
                .map(m -> {
                    StudentMarkDTO dto = new StudentMarkDTO();
                    dto.setStudentId(m.getStudent().getId());
                    dto.setObtainedValue(m.getObtainedValue());
                    return dto;
                }).collect(Collectors.toList());
    }
}