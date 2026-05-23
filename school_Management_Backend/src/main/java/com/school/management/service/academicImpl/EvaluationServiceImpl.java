package com.school.management.service.academicImpl;

import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.EvaluationCreateDTO;
import com.school.management.dto.academic.EvaluationResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.model.enums.EvaluationType;
import com.school.management.model.enums.VisaStatus;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationTaskRepository taskRepository;
    private final StudentMarkRepository markRepository;
    private final TeacherAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final PeriodValidationRepository validationRepository;

    @Override
    @Transactional
    public void createEvaluationWithMarks(EvaluationCreateDTO dto) {
        TeacherAssignment ta = assignmentRepository.findById(dto.getTeacherAssignmentId())
                .orElseThrow(() -> new RuntimeException("Affectation enseignant non trouvée"));

        // VERIFICATION DU VISA
        VisaStatus status = getPeriodVisaStatus(ta.getId(), dto.getPeriod());
        if (status != VisaStatus.DRAFT) {
            throw new RuntimeException("Opération impossible : Les cotes de cette période ont déjà été soumises à la Direction.");
        }

        CourseAssignment config = ta.getCourseAssignment();
        List<EvaluationTask> periodTasks = taskRepository.findByTeacherAssignmentIdAndPeriod(ta.getId(), dto.getPeriod());
        boolean isUpdate = dto.getId() != null;

        // LOGIQUE SPECIALE ENUM EXAMEN VS EVALUATIONS CONTINUES
        if (dto.getType() == EvaluationType.EXAMEN) {
            if (dto.getPeriod() != 2 && dto.getPeriod() != 4) {
                throw new RuntimeException("Action impossible : Un examen ne peut être programmé qu'en Période 2 ou Période 4.");
            }
            double maxExamAllowed = (dto.getPeriod() == 2) ? config.getMaxExam1() : config.getMaxExam2();
            if (dto.getMaxPoints() > maxExamAllowed) {
                throw new RuntimeException("Action impossible : Le maxima de l'examen (" + dto.getMaxPoints() + ") ne peut pas dépasser le maxima autorisé (" + maxExamAllowed + ")");
            }
            // Vérification de l'unicité de la colonne EXAMEN pour le semestre
            for (EvaluationTask t : periodTasks) {
                if (t.getType() == EvaluationType.EXAMEN && (!isUpdate || !t.getId().equals(dto.getId()))) {
                    throw new RuntimeException("Action impossible : Un examen a déjà été enregistré pour cette période.");
                }
            }
        } else {
            // Pour les interros, devoirs, CC : Calcul du cumul sans inclure l'examen
            double maxConfiguredForPeriod = getPeriodMaxFromConfig(config, dto.getPeriod());
            double currentRegularSum = periodTasks.stream()
                    .filter(t -> t.getType() != EvaluationType.EXAMEN)
                    .filter(t -> !isUpdate || !t.getId().equals(dto.getId()))
                    .mapToDouble(EvaluationTask::getMaxPoints)
                    .sum();

            if (currentRegularSum + dto.getMaxPoints() > maxConfiguredForPeriod) {
                throw new RuntimeException("Action impossible : Le cumul des maxima de la période ("
                        + (currentRegularSum + dto.getMaxPoints()) + ") dépasserait le maxima autorisé (" + maxConfiguredForPeriod + ")");
            }
        }

        EvaluationTask task;
        if (isUpdate) {
            task = taskRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Évaluation non trouvée"));
            task.setTitle(dto.getTitle());
            task.setType(dto.getType());
            task.setMaxPoints(dto.getMaxPoints());
            task.setPeriod(dto.getPeriod());
        } else {
            task = EvaluationTask.builder()
                    .title(dto.getTitle())
                    .type(dto.getType())
                    .maxPoints(dto.getMaxPoints())
                    .period(dto.getPeriod())
                    .teacherAssignment(ta)
                    .academicYear(ta.getAcademicYear())
                    .evaluationDate(LocalDate.now())
                    .build();
        }

        EvaluationTask savedTask = taskRepository.save(task);
        List<StudentMark> existingMarks = markRepository.findByEvaluationTaskId(savedTask.getId());

        dto.getMarks().forEach(markDto -> {
            Student student = studentRepository.findById(markDto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Élève non trouvé"));

            // SÉCURITÉ SERVER-SIDE ANTI-CORRUPTION DES DONNÉES
            if (markDto.getObtainedValue() > dto.getMaxPoints()) {
                throw new RuntimeException("Sécurité : La note de l'élève " + student.getFirstName() + " (" + markDto.getObtainedValue() + ") ne peut pas être supérieure au maxima configuré de " + dto.getMaxPoints());
            }

            StudentMark mark = existingMarks.stream()
                    .filter(m -> m.getStudent().getId().equals(student.getId()))
                    .findFirst()
                    .orElse(null);

            if (mark != null) {
                mark.setObtainedValue(markDto.getObtainedValue());
            } else {
                mark = StudentMark.builder()
                        .student(student)
                        .evaluationTask(savedTask)
                        .obtainedValue(markDto.getObtainedValue())
                        .build();
            }
            markRepository.save(mark);
        });
    }

    private double getPeriodMaxFromConfig(CourseAssignment config, int period) {
        return switch (period) {
            case 1 -> config.getMaxP1();
            case 2 -> config.getMaxP2();
            case 3 -> config.getMaxP3();
            case 4 -> config.getMaxP4();
            default -> throw new RuntimeException("Période invalide");
        };
    }

    @Override
    public List<EvaluationResponseDTO> getEvaluationsByAssignment(Long taId, int period) {
        return taskRepository.findByTeacherAssignmentIdAndPeriod(taId, period).stream()
                .map(task -> EvaluationResponseDTO.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .type(task.getType())
                        .maxPoints(task.getMaxPoints())
                        .period(task.getPeriod())
                        .evaluationDate(task.getEvaluationDate())
                        .subjectName(task.getTeacherAssignment().getCourseAssignment().getSubject().getName())
                        .classroomName(task.getTeacherAssignment().getClassroom().getDisplayName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public double getCurrentPeriodTotalMax(Long taId, int period) {
        List<EvaluationTask> periodTasks = taskRepository.findByTeacherAssignmentIdAndPeriod(taId, period);
        return periodTasks.stream()
                .filter(t -> t.getType() != EvaluationType.EXAMEN)
                .mapToDouble(EvaluationTask::getMaxPoints)
                .sum();
    }

    @Override
    @Transactional
    public void submitPeriodForVisa(Long taId, int period) {
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .orElseGet(() -> {
                    TeacherAssignment ta = assignmentRepository.findById(taId)
                            .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));
                    return PeriodValidation.builder()
                            .teacherAssignment(ta)
                            .period(period)
                            .build();
                });

        validation.setStatus(VisaStatus.SUBMITTED_TO_PROVISEUR);
        validation.setSubmissionDate(LocalDateTime.now());
        validationRepository.save(validation);
    }

    @Override
    public VisaStatus getPeriodVisaStatus(Long taId, int period) {
        return validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .map(PeriodValidation::getStatus)
                .orElse(VisaStatus.DRAFT);
    }

    @Override
    public CourseAssignmentResponseDTO getCourseConfigByAssignment(Long taId) {
        TeacherAssignment ta = assignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));
        CourseAssignment entity = ta.getCourseAssignment();
        Subject s = entity.getSubject();
        return CourseAssignmentResponseDTO.builder()
                .id(entity.getId())
                .subjectId(s.getId())
                .subjectName(s.getName())
                .levelId(entity.getLevel().getId())
                .levelName(entity.getLevel().getName())
                .maxP1(entity.getMaxP1())
                .maxP2(entity.getMaxP2())
                .maxExam1(entity.getMaxExam1())
                .maxP3(entity.getMaxP3())
                .maxP4(entity.getMaxP4())
                .maxExam2(entity.getMaxExam2())
                .maxS1(entity.getMaxS1())
                .maxS2(entity.getMaxS2())
                .maxTotal(entity.getMaxTotal())
                .build();
    }
}
