package com.school.management.service.academicImpl;

import com.school.management.dto.academic.StudentMarkDTO;
import com.school.management.model.academic.StudentMark;
import com.school.management.repository.academic.StudentMarkRepository;
import com.school.management.service.academic.StudentMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class StudentMarkServiceImpl implements StudentMarkService {

    private final StudentMarkRepository markRepository;

    @Override
    @Transactional
    public void updateStudentMark(Long markId, double newValue) {
        StudentMark mark = markRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Note non trouvée"));

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
