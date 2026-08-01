package com.school.management.service.academicImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.model.academic.Bulletin;
import com.school.management.model.academic.BulletinFolder;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.FicheValidation;
import com.school.management.model.academic.Student;
import com.school.management.model.academic.TeacherBulletinNotification;
import com.school.management.repository.academic.BulletinFolderRepository;
import com.school.management.repository.academic.BulletinRepository;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.FicheValidationRepository;
import com.school.management.repository.academic.TeacherBulletinNotificationRepository;
import com.school.management.service.academic.BulletinTitulaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.school.management.model.enums.ValidationStatus.VALIDATED;

@Service
public class BulletinTitulaireServiceImpl implements BulletinTitulaireService {

    @Autowired
    private FicheValidationRepository ficheValidationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private BulletinRepository bulletinRepository;

    @Autowired
    private BulletinFolderRepository bulletinFolderRepository;

    @Autowired
    private TeacherBulletinNotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public void validateGradeSheet(Long classroomId, Long subjectId, String periodId, Long academicYearId, Long schoolId) {
        FicheValidation validation = ficheValidationRepository
                .findByClassroomIdAndSubjectIdAndPeriodIdAndAcademicYearIdAndSchoolId(classroomId, subjectId, periodId, academicYearId, schoolId)
                .orElseThrow(() -> new IllegalStateException("Aucune fiche transmise par le Proviseur trouvée pour cette sélection."));

        if (validation.getStatus() == VALIDATED || "VALIDATED".equals(validation.getStatus().name())) {
            throw new IllegalStateException("Cette fiche matricielle a déjà été validée au bulletin.");
        }

        validation.setStatus(VALIDATED);
        validation.setValidatedAt(LocalDateTime.now());
        ficheValidationRepository.save(validation);
    }

    @Override
    public void notifyTeacherOnRelease(Long schoolId, Long teacherId, String classroomName, String periodId) {

        TeacherBulletinNotification notification = TeacherBulletinNotification.builder()
                .teacherId(teacherId)
                .schoolId(schoolId)
                .title("Nouvelle Fiche de Cotes")
                .message(String.format("Le Proviseur vient de vous transmettre les cotes de la classe %s pour la Période %s à vérifier.", classroomName, periodId))
                .actionType("REFRESH_MONITORING")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("notificationId", notification.getId());
            payloadMap.put("message", notification.getMessage());
            payloadMap.put("classroomName", classroomName);
            payloadMap.put("periodId", periodId);
            payloadMap.put("action", "REFRESH_MONITORING");
            payloadMap.put("type", "REFRESH_MONITORING");
            payloadMap.put("teacherId", teacherId);
            payloadMap.put("schoolId", schoolId);
            payloadMap.put("timestamp", notification.getCreatedAt().toString());

            String payload = objectMapper.writeValueAsString(payloadMap);
            String dynamicTopic = String.format("/topic/bulletins/titulaire/%d/%d", schoolId, teacherId);

            messagingTemplate.convertAndSend(dynamicTopic, payload);
        } catch (Exception e) {
            System.err.println("Erreur d'envoi WebSocket notifyTeacherOnRelease : " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<BulletinFolderDTO> getBulletinFolders(Long teacherId, Long academicYearId, Long schoolId) {
        List<Classroom> classrooms = classroomRepository.findByTitulaireIdAndSchoolIdAndActiveTrue(teacherId, schoolId);
        List<BulletinFolderDTO> folders = new ArrayList<>();

        for (Classroom c : classrooms) {
            bulletinFolderRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(c.getId(), academicYearId, schoolId)
                    .ifPresent(folder -> {
                        long totalBulletins = bulletinRepository.countByFolderId(folder.getId());

                        // Auto-réparation si des bulletins existaient sans lien de dossier
                        if (totalBulletins == 0) {
                            List<Bulletin> unlinked = bulletinRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(
                                    c.getId(), academicYearId, schoolId);
                            if (!unlinked.isEmpty()) {
                                for (Bulletin b : unlinked) {
                                    b.setFolder(folder);
                                    bulletinRepository.save(b);
                                }
                                totalBulletins = unlinked.size();
                            }
                        }

                        long validatedBulletins = bulletinRepository.countByFolderIdAndStatus(folder.getId(), "VALIDATED");

                        String status = folder.getStatus();
                        if (totalBulletins > 0 && validatedBulletins == totalBulletins) {
                            status = "COMPLET";
                            folder.setStatus(status);
                            bulletinFolderRepository.save(folder);
                        }

                        folders.add(BulletinFolderDTO.builder()
                                .folderId(folder.getId())
                                .folderName(folder.getFolderName())
                                .classroomId(c.getId())
                                .classroomName(c.getDisplayName())
                                .totalBulletins(totalBulletins)
                                .validatedBulletins(validatedBulletins)
                                .status(status)
                                .createdAt(folder.getCreatedAt())
                                .build());
                    });
        }
        return folders;
    }

    @Override
    @Transactional
    public List<StudentBulletinRowDTO> getStudentsInFolder(Long folderId) {
        List<Bulletin> bulletins = bulletinRepository.findByFolderId(folderId);

        // Repli de sécurité si l'ID passé est l'ID de la classe ou si la liaison manque
        if (bulletins.isEmpty()) {
            var folderOpt = bulletinFolderRepository.findById(folderId);
            if (folderOpt.isPresent()) {
                BulletinFolder folder = folderOpt.get();
                List<Bulletin> unlinked = bulletinRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(
                        folder.getClassroom().getId(),
                        folder.getAcademicYear().getId(),
                        folder.getSchool().getId()
                );
                if (!unlinked.isEmpty()) {
                    for (Bulletin b : unlinked) {
                        b.setFolder(folder);
                        bulletinRepository.save(b);
                    }
                    bulletins = unlinked;
                }
            } else {
                List<BulletinFolder> classroomFolders = bulletinFolderRepository.findByClassroomId(folderId);
                if (!classroomFolders.isEmpty()) {
                    BulletinFolder folder = classroomFolders.get(0);
                    bulletins = bulletinRepository.findByFolderId(folder.getId());
                }
            }
        }

        return bulletins.stream().map(b -> {
            Student s = b.getStudent();
            return StudentBulletinRowDTO.builder()
                    .studentId(s.getId())
                    .fullName(s.getFullName())
                    .gender(s.getGender() != null ? s.getGender().name() : "N/A")
                    .permanentNumber(s.getPermanentNumber())
                    .bulletinId(b.getId())
                    .status(b.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }

    // AJOUT : Implémentation de la méthode manquante pour récupérer les données du bulletin
    // Note: Ajoutez l'annotation @Override si vous avez ajouté cette méthode dans l'interface BulletinTitulaireService
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentBulletinData(Long folderId, Long studentId) {
        Map<String, Object> response = new HashMap<>();

        // Logique métier à compléter avec vos repositories pour récupérer les vraies données
        // Exemple :
        // Student student = studentRepository.findById(studentId).orElseThrow(...);
        // List<BranchData> branches = bulletinRepository.findBranchesByStudentId(...);

        // Structure de base attendue par votre frontend (StudentBulletinView.jsx)
        response.put("student", null); // Remplacer par l'objet DTO de l'étudiant
        response.put("branches", new ArrayList<>()); // Remplacer par la liste des cotes

        return response;
    }

    @Override
    public List<TeacherBulletinNotification> getTeacherNotifications(Long teacherId, Long schoolId) {
        return notificationRepository.findByTeacherIdAndSchoolIdOrderByCreatedAtDesc(teacherId, schoolId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}