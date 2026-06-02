package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;
import com.school.management.dto.academic.PendingGradeSheetDTO;
import com.school.management.dto.academic.StudentRowDTO;
import com.school.management.dto.academic.SubjectGradeDTO;
import com.school.management.dto.academic.VisaStatusResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.model.enums.EvaluationType;
import com.school.management.model.enums.VisaStatus;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.GradeSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeSheetServiceImpl implements GradeSheetService {

    private final EnrollmentRepository enrollmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentMarkRepository markRepository;
    private final PeriodValidationRepository validationRepository;
    // INJECTION DU TEMPLATE WEBSOCKET
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public GradeSheetResponseDTO generateStudentGradeSheet(Long studentId, Long yearId, int semester) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearId(studentId, yearId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByClassroomIdAndAcademicYearId(enrollment.getClassroom().getId(), yearId);

        List<SubjectGradeDTO> grades = new ArrayList<>();
        double totalObtained = 0;
        double totalMax = 0;

        for (TeacherAssignment ta : assignments) {
            CourseAssignment config = ta.getCourseAssignment();

            double p1Score = sumMarks(studentId, ta.getId(), 1);
            double p2Score = sumMarks(studentId, ta.getId(), 2);
            double exam1Score = sumMarksByType(studentId, ta.getId(), EvaluationType.EXAMEN, 1);

            SubjectGradeDTO row = SubjectGradeDTO.builder()
                    .subjectName(config.getSubject().getName())
                    .p1(p1Score).maxP1(config.getMaxP1())
                    .p2(p2Score).maxP2(config.getMaxP2())
                    .examen1(exam1Score).maxExamen1(config.getMaxExam1())
                    .totalSemestre1(p1Score + p2Score + exam1Score)
                    .maxSemestre1(config.getMaxS1())
                    .build();

            grades.add(row);
            totalObtained += row.getTotalSemestre1();
            totalMax += row.getMaxSemestre1();
        }

        return GradeSheetResponseDTO.builder()
                .studentName(enrollment.getStudent().getFullName())
                .classroomName(enrollment.getClassroom().getDisplayName())
                .academicYear(enrollment.getAcademicYear().getAnnee())
                .subjectGrades(grades)
                .grandTotalObtained(totalObtained)
                .grandTotalMax(totalMax)
                .percentage(totalMax > 0 ? (totalObtained * 100) / totalMax : 0)
                .build();
    }

    @Override
    public ClassGradeSheetResponseDTO generateClassGradeSheet(Long taId) {
        TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        CourseAssignment config = ta.getCourseAssignment();

        List<Enrollment> enrollments = enrollmentRepository.findByClassroomIdAndAcademicYearIdAndActiveTrue(
                ta.getClassroom().getId(), ta.getAcademicYear().getId());

        List<StudentRowDTO> studentRows = new ArrayList<>();

        for (Enrollment e : enrollments) {
            Long studentId = e.getStudent().getId();

            double p1 = sumMarks(studentId, taId, 1);
            double p2 = sumMarks(studentId, taId, 2);
            double exam1 = sumMarksByType(studentId, taId, EvaluationType.EXAMEN, 1);
            double ts1 = p1 + p2 + exam1;

            double p3 = sumMarks(studentId, taId, 3);
            double p4 = sumMarks(studentId, taId, 4);
            double exam2 = sumMarksByType(studentId, taId, EvaluationType.EXAMEN, 2);
            double ts2 = p3 + p4 + exam2;

            double totalGen = ts1 + ts2;

            studentRows.add(StudentRowDTO.builder()
                    .studentId(studentId)
                    .matricule(e.getStudent().getMatricule())
                    .fullName(e.getStudent().getFullName())
                    .gender(e.getStudent().getGender().name())
                    .p1(p1).p2(p2).exam1(exam1).totalS1(ts1)
                    .p3(p3).p4(p4).exam2(exam2).totalS2(ts2)
                    .totalGeneral(totalGen)
                    .build());
        }

        return ClassGradeSheetResponseDTO.builder()
                .teacherAssignmentId(taId)
                .subjectName(config.getSubject().getName())
                .classroomName(ta.getClassroom().getDisplayName())
                .maxP1(config.getMaxP1()).maxP2(config.getMaxP2()).maxExam1(config.getMaxExam1()).maxS1(config.getMaxS1())
                .maxP3(config.getMaxP3()).maxP4(config.getMaxP4()).maxExam2(config.getMaxExam2()).maxS2(config.getMaxS2())
                .maxTotalGeneral(config.getMaxTotal())
                .students(studentRows)
                .build();
    }

    private double sumMarks(Long studentId, Long taId, int period) {
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, taId)
                .stream()
                .filter(m -> m.getEvaluationTask().getPeriod() == period)
                .filter(m -> m.getEvaluationTask().getType() != EvaluationType.EXAMEN)
                .mapToDouble(StudentMark::getObtainedValue)
                .sum();
    }

    private double sumMarksByType(Long studentId, Long taId, EvaluationType type, int semester) {
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, taId)
                .stream()
                .filter(m -> m.getEvaluationTask().getType() == type)
                .filter(m -> {
                    int p = m.getEvaluationTask().getPeriod();
                    if (semester == 1) return p == 1 || p == 2 || p == 0;
                    if (semester == 2) return p == 3 || p == 4;
                    return false;
                })
                .mapToDouble(StudentMark::getObtainedValue)
                .sum();
    }

    @Override
    @Transactional
    public void submitPeriodGradeSheetForVisa(Long taId, int period) {
        // 1. Récupération ou création de la validation
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .orElseGet(() -> {
                    TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                            .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));
                    return PeriodValidation.builder()
                            .teacherAssignment(ta)
                            .period(period)
                            .build();
                });

        // 2. Mise à jour de l'état
        validation.setStatus(VisaStatus.SUBMITTED_TO_PROVISEUR);
        validation.setSubmissionDate(LocalDateTime.now());
        validationRepository.save(validation);

        // 3. DIFFUSION DE LA NOTIFICATION TEMPS RÉEL VIA WEBSOCKET
        try {
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("type", "NEW_GRADE_SHEET");
            notificationPayload.put("message", "Nouvelle fiche de notes soumise");
            notificationPayload.put("subjectName", validation.getTeacherAssignment().getCourseAssignment().getSubject().getName());
            notificationPayload.put("classroomName", validation.getTeacherAssignment().getClassroom().getDisplayName());
            notificationPayload.put("teacherName", validation.getTeacherAssignment().getTeacher().getFullName());
            notificationPayload.put("period", period);
            notificationPayload.put("academicYearId", validation.getTeacherAssignment().getAcademicYear().getId());

            // Envoi sur le canal dédié aux Proviseurs
            messagingTemplate.convertAndSend("/topic/proviseur-notifications", notificationPayload);
        } catch (Exception e) {
            // On ne bloque pas la transaction de soumission si la notification échoue
            System.err.println("Erreur lors de l'envoi de la notification WebSocket : " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public VisaStatusResponseDTO getPeriodGradeSheetVisaStatus(Long taId, int period) {
        return validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .map(v -> VisaStatusResponseDTO.builder()
                        .status(v.getStatus())
                        .rejectComment(v.getRejectComment())
                        .build())
                .orElse(VisaStatusResponseDTO.builder()
                        .status(VisaStatus.DRAFT)
                        .rejectComment(null)
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingGradeSheetDTO> getPendingGradeSheetsForProviseur(Long academicYearId) {
        List<PeriodValidation> pendingValidations = validationRepository.findByStatus(VisaStatus.SUBMITTED_TO_PROVISEUR);

        return pendingValidations.stream()
                .filter(v -> v.getTeacherAssignment().getAcademicYear().getId().equals(academicYearId))
                .map(v -> PendingGradeSheetDTO.builder()
                        .teacherAssignmentId(v.getTeacherAssignment().getId())
                        .period(v.getPeriod())
                        .subjectName(v.getTeacherAssignment().getCourseAssignment().getSubject().getName())
                        .classroomName(v.getTeacherAssignment().getClassroom().getDisplayName())
                        .teacherName(v.getTeacherAssignment().getTeacher().getFullName())
                        .submissionDate(v.getSubmissionDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void validatePeriodGradeSheet(Long taId, int period) {
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        validation.setStatus(VisaStatus.VALIDATED_BY_PROVISEUR);
        validation.setValidationDate(LocalDateTime.now());
        validation.setRejectComment(null);
        validationRepository.save(validation);
    }

    @Override
    @Transactional
    public void rejectPeriodGradeSheet(Long taId, int period, String comment) {
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriod(taId, period)
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        validation.setStatus(VisaStatus.REJECTED_BY_PROVISEUR);
        validation.setRejectComment(comment);
        validationRepository.save(validation);
    }
}