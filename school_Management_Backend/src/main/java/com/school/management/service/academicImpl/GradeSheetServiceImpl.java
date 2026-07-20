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
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
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
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * ✅ GESTION DU CONTEXTE MUTLI-TENANT SÉCURISÉ
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
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional(readOnly = true)
    public GradeSheetResponseDTO generateStudentGradeSheet(Long studentId, Long yearId, int semester) {
        // ✅ CORRECTION MULTI-TENANT : Utilisation de la méthode sécurisée par établissement
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearIdAndSchoolId(studentId, yearId, getCurrentSchoolId())
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        // ✅ SÉCURITÉ EXTENSION INTER-ÉCOLES
        if (!enrollment.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Accès interdit aux bulletins de cet établissement.");
        }

        // ✅ INJECTION DU SÉPARATEUR MULTI-TENANT DANS LES REQUÊTES DERIVÉES
        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByClassroomIdAndAcademicYearIdAndSchoolId(enrollment.getClassroom().getId(), yearId, getCurrentSchoolId());

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
    @Transactional(readOnly = true)
    public ClassGradeSheetResponseDTO generateClassGradeSheet(Long taId) {
        TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        // ✅ VÉRIFICATION MULTI-TENANT AVANT ACCÈS AUX BULLETINS DE CLASSE
        if (!ta.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Accès refusé : Cette classe appartient à un autre établissement.");
        }

        CourseAssignment config = ta.getCourseAssignment();

        // ✅ CORRECTION MULTI-TENANT : Filtrage local des inscriptions par établissement rattaché
        List<Enrollment> enrollments = enrollmentRepository.findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(
                ta.getClassroom().getId(), ta.getAcademicYear().getId(), getCurrentSchoolId());

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
        // ✅ ADAPTATION AUX SÉPARATEURS PAR ÉCOLE MAINTENUE SÉCURISÉE
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentIdAndSchoolId(studentId, taId, getCurrentSchoolId())
                .stream()
                .filter(m -> m.getEvaluationTask().getPeriod() == period)
                .filter(m -> m.getEvaluationTask().getType() != EvaluationType.EXAMEN)
                .mapToDouble(StudentMark::getObtainedValue)
                .sum();
    }

    private double sumMarksByType(Long studentId, Long taId, EvaluationType type, int semester) {
        // ✅ ADAPTATION AUX SÉPARATEURS PAR ÉCOLE MAINTENUE SÉCURISÉE
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentIdAndSchoolId(studentId, taId, getCurrentSchoolId())
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
        Long schoolId = getCurrentSchoolId();
        TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        // ✅ SÉCURITÉ DE VÉRIFICATION DU TENANT ACTIF
        if (!ta.getSchool().getId().equals(schoolId)) {
            throw new AccessDeniedException("❌ Soumission impossible : Ressources non associées à votre école.");
        }

        // 1. ✅ CORRECTION MULTI-TENANT : Recherche du visa avec cloisonnement par établissement
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, schoolId)
                .orElseGet(() -> PeriodValidation.builder()
                        .teacherAssignment(ta)
                        .period(period)
                        .school(ta.getSchool()) // Lien d'école propagé
                        .build());

        // 2. Mise à jour de l'état
        validation.setStatus(VisaStatus.SUBMITTED_TO_PROVISEUR);
        validation.setSubmissionDate(LocalDateTime.now());
        validationRepository.save(validation);

        // 3. DIFFUSION DE LA NOTIFICATION TEMPS RÉEL VIA WEBSOCKET (Canal Sécurisé Multi-tenant)
        try {
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("type", "NEW_GRADE_SHEET");
            notificationPayload.put("message", "Nouvelle fiche de notes soumise");
            notificationPayload.put("subjectName", validation.getTeacherAssignment().getCourseAssignment().getSubject().getName());
            notificationPayload.put("classroomName", validation.getTeacherAssignment().getClassroom().getDisplayName());
            notificationPayload.put("teacherName", validation.getTeacherAssignment().getTeacher().getFullName());
            notificationPayload.put("period", period);
            notificationPayload.put("academicYearId", validation.getTeacherAssignment().getAcademicYear().getId());
            notificationPayload.put("schoolId", schoolId); // Marquage tenant sur le payload

            // Envoi sur le canal filtré de l'établissement
            messagingTemplate.convertAndSend("/topic/proviseur-notifications/" + schoolId, notificationPayload);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification WebSocket : " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public VisaStatusResponseDTO getPeriodGradeSheetVisaStatus(Long taId, int period) {
        TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        if (!ta.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Consultation interdite : Accès hors périmètre.");
        }

        // ✅ CORRECTION MULTI-TENANT : Recherche ciblée par scope d'établissement
        return validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, getCurrentSchoolId())
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
        // ✅ CORRECTION MULTI-TENANT & OPTIMISATION : Sélection directe en base uniquement pour l'école courante
        List<PeriodValidation> pendingValidations = validationRepository.findByStatusAndSchoolId(VisaStatus.SUBMITTED_TO_PROVISEUR, getCurrentSchoolId());

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
        Long schoolId = getCurrentSchoolId();
        // ✅ CORRECTION MULTI-TENANT : Récupération sécurisée par école pour empêcher l'exécution de requêtes croisées
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, schoolId)
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        // PROTECTION MULTI-TENANT
        if (!validation.getTeacherAssignment().getSchool().getId().equals(schoolId)) {
            throw new AccessDeniedException("❌ Validation refusée : Cette ressource n'appartient pas à votre école.");
        }

        validation.setStatus(VisaStatus.VALIDATED_BY_PROVISEUR);
        validation.setValidationDate(LocalDateTime.now());
        validation.setRejectComment(null);
        validationRepository.save(validation);

        // ✅ DIFFUSION DE LA NOTIFICATION EN TEMPS RÉEL AU TITULAIRE VIA WEBSOCKET (Canal Sécurisé Multi-tenant)
        try {
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("type", "BULLETIN_READY_FOR_TITULAIRE");
            notificationPayload.put("message", "Le Proviseur a visé la fiche de notes. Prête pour le bulletin !");
            notificationPayload.put("subjectName", validation.getTeacherAssignment().getCourseAssignment().getSubject().getName());
            notificationPayload.put("classroomName", validation.getTeacherAssignment().getClassroom().getDisplayName());
            notificationPayload.put("classroomId", validation.getTeacherAssignment().getClassroom().getId());
            notificationPayload.put("period", period);
            notificationPayload.put("schoolId", schoolId);

            // Envoi sur le canal filtré de l'établissement pour les titulaires
            messagingTemplate.convertAndSend("/topic/titulaire-notifications/" + schoolId, notificationPayload);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification au Titulaire : " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void rejectPeriodGradeSheet(Long taId, int period, String comment) {
        // ✅ CORRECTION MULTI-TENANT : Récupération sécurisée par école
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, getCurrentSchoolId())
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        // PROTECTION MULTI-TENANT
        if (!validation.getTeacherAssignment().getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Rejet refusé : Cette ressource n'appartient pas à votre école.");
        }

        validation.setStatus(VisaStatus.REJECTED_BY_PROVISEUR);
        validation.setRejectComment(comment);
        validationRepository.save(validation);
    }

    @Override
    @Transactional
    public void validateGradeSheetByTitulaire(Long taId, int period) {
        Long schoolId = getCurrentSchoolId();
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, schoolId)
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        if (!validation.getTeacherAssignment().getSchool().getId().equals(schoolId)) {
            throw new AccessDeniedException("❌ Action refusée : Cette ressource n'appartient pas à votre école.");
        }

        if (validation.getStatus() != VisaStatus.VALIDATED_BY_PROVISEUR) {
            throw new RuntimeException("Action impossible : La fiche doit d'abord être validée par le Proviseur.");
        }

        validation.setStatus(VisaStatus.VALIDATED_BY_TITULAIRE);
        validationRepository.save(validation);
    }

    @Override
    @Transactional
    public void reportErrorByTitulaire(Long taId, int period, String comment) {
        Long schoolId = getCurrentSchoolId();
        PeriodValidation validation = validationRepository.findByTeacherAssignmentIdAndPeriodAndSchoolId(taId, period, schoolId)
                .orElseThrow(() -> new RuntimeException("Fiche de notes introuvable pour cette période."));

        if (!validation.getTeacherAssignment().getSchool().getId().equals(schoolId)) {
            throw new AccessDeniedException("❌ Action refusée : Cette ressource n'appartient pas à votre école.");
        }

        validation.setStatus(VisaStatus.ERROR_REPORTED_BY_TITULAIRE);
        validation.setRejectComment(comment); // Utilisation du champ existant pour stocker le retour d'erreur
        validationRepository.save(validation);
    }
}