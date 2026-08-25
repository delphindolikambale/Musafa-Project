package com.school.management.service.academicImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.BulletinInitResponseDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Bulletin;
import com.school.management.model.academic.BulletinFolder;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.FicheValidation;
import com.school.management.model.academic.Student;
import com.school.management.model.academic.TeacherBulletinNotification;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.BulletinFolderRepository;
import com.school.management.repository.academic.BulletinHeaderRepository;
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
    private BulletinHeaderRepository bulletinHeaderRepository;

    @Autowired
    private TeacherBulletinNotificationRepository notificationRepository;

    @Autowired
    private BulletinProviseurServiceImpl bulletinProviseurService;

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

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentBulletinData(Long classroomId, Long studentId) {
        Map<String, Object> response = new HashMap<>();

        // 1. Récupération via l'ID de la classe
        List<Bulletin> bulletins = bulletinRepository.findByClassroomId(classroomId);

        // 2. Filtrage pour trouver le bulletin de l'élève
        Bulletin studentBulletin = bulletins.stream()
                .filter(b -> b.getStudent() != null && b.getStudent().getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun bulletin trouvé pour l'élève ID " + studentId + " dans la classe ID " + classroomId));

        Student student = studentBulletin.getStudent();
        Classroom classroom = studentBulletin.getClassroom();
        School school = studentBulletin.getSchool();
        AcademicYear academicYear = studentBulletin.getAcademicYear();

        // 3. Construction des informations de l'élève (avec intégration du lieu, date de naissance et N° ID)
        Map<String, Object> studentInfo = new HashMap<>();
        studentInfo.put("id", student.getId());
        studentInfo.put("fullName", student.getFullName());
        studentInfo.put("firstName", student.getFirstName());
        studentInfo.put("lastName", student.getLastName());
        studentInfo.put("postName", student.getPostName());
        studentInfo.put("gender", student.getGender() != null ? student.getGender().name() : "N/A");
        studentInfo.put("permanentNumber", student.getPermanentNumber());
        studentInfo.put("nationalId", student.getNationalId());
        studentInfo.put("birthPlace", student.getBirthPlace());
        studentInfo.put("birthDate", student.getBirthDate() != null ? student.getBirthDate().toString() : null);

        // 4. En-tête administratif complet du bulletin avec fusion multi-tenant officielle
        Map<String, Object> header = new HashMap<>();

        if (school != null) {
            bulletinHeaderRepository.findBySchoolId(school.getId()).ifPresent(officialHeader -> {
                header.put("country", officialHeader.getCountry());
                header.put("ministry", officialHeader.getMinistry());
                header.put("educationalProvince", officialHeader.getEducationalProvince());
                header.put("city", officialHeader.getCity());
                header.put("communeTerritory", officialHeader.getCommuneTerritory());
                header.put("schoolName", officialHeader.getSchoolName());
                header.put("schoolCode", officialHeader.getSchoolCode());
                header.put("flagImagePath", officialHeader.getFlagImagePath());
                header.put("ministryLogoPath", officialHeader.getMinistryLogoPath());
                header.put("watermarkLogoPath", officialHeader.getWatermarkLogoPath());
            });
        }

        // Valeurs de secours issues de l'école si la configuration d'en-tête globale est partielle
        header.putIfAbsent("educationalProvince", school != null && school.getProvince() != null ? school.getProvince() : "");
        header.putIfAbsent("province", school != null && school.getProvince() != null ? school.getProvince() : "");
        header.putIfAbsent("city", school != null && school.getCity() != null ? school.getCity() : "");
        header.putIfAbsent("ville", school != null && school.getCity() != null ? school.getCity() : "");
        header.putIfAbsent("communeTerritory", school != null && school.getCity() != null ? school.getCity() : "");
        header.putIfAbsent("schoolName", school != null && school.getName() != null ? school.getName() : "");
        header.putIfAbsent("schoolCode", school != null && school.getCode() != null ? school.getCode() : "");
        header.put("className", classroom != null ? classroom.getDisplayName() : "");
        header.put("academicYear", academicYear != null ? academicYear.getAnnee() : "");

        // 5. Récupération dynamique de la grille officielle générée par le Proviseur
        BulletinInitResponseDTO bulletinData = bulletinProviseurService.getBulletinInitData(
                classroomId,
                academicYear != null ? academicYear.getId() : null,
                school != null ? school.getId() : null
        );

        // 6. Assemblage de la réponse finale
        response.put("student", studentInfo);
        response.put("header", header);
        response.put("bulletinData", bulletinData);
        response.put("bulletinId", studentBulletin.getId());
        response.put("status", studentBulletin.getStatus());

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