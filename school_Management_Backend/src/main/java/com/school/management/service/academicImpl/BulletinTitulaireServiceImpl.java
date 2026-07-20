package com.school.management.service.academicImpl;

import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.model.academic.Bulletin;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.FicheValidation;
import com.school.management.model.academic.Student;
import com.school.management.repository.academic.BulletinRepository;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.FicheValidationRepository;
import com.school.management.service.academic.BulletinTitulaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
        String payload = String.format(
                "{\"message\": \"Le Proviseur vient de vous transmettre les cotes de la classe %s pour la Période %s à vérifier.\", " +
                        "\"classroomName\": \"%s\", " +
                        "\"periodId\": \"%s\", " +
                        "\"action\": \"REFRESH_MONITORING\", " +
                        "\"teacherId\": %d, " +
                        "\"schoolId\": %d, " +
                        "\"timestamp\": \"%s\"}",
                classroomName, periodId, classroomName, periodId, teacherId, schoolId, LocalDateTime.now().toString()
        );

        // ✅ CORRECTION : Routage dynamique vers le topic écouté par le TitulaireDashboard.jsx
        String dynamicTopic = String.format("/topic/bulletins/titulaire/%d/%d", schoolId, teacherId);
        messagingTemplate.convertAndSend(dynamicTopic, payload);
    }

    @Override
    public List<BulletinFolderDTO> getBulletinFolders(Long teacherId, Long academicYearId, Long schoolId) {
        List<Classroom> classrooms = classroomRepository.findByTitulaireIdAndSchoolIdAndActiveTrue(teacherId, schoolId);
        List<BulletinFolderDTO> folders = new ArrayList<>();

        for (Classroom c : classrooms) {
            long totalBulletins = bulletinRepository.countByClassroomIdAndAcademicYearIdAndSchoolId(c.getId(), academicYearId, schoolId);

            if (totalBulletins > 0) {
                long validatedBulletins = bulletinRepository.countByClassroomIdAndAcademicYearIdAndSchoolIdAndStatus(c.getId(), academicYearId, schoolId, "VALIDATED");

                String status = "EN COURS";
                if (validatedBulletins == 0) status = "NOUVEAU";
                else if (validatedBulletins == totalBulletins) status = "COMPLET";

                folders.add(BulletinFolderDTO.builder()
                        .classroomId(c.getId())
                        .classroomName(c.getDisplayName())
                        .totalBulletins(totalBulletins)
                        .validatedBulletins(validatedBulletins)
                        .status(status)
                        .build());
            }
        }
        return folders;
    }

    @Override
    public List<StudentBulletinRowDTO> getStudentsInFolder(Long classroomId, Long academicYearId, Long schoolId) {
        List<Bulletin> bulletins;
        if (academicYearId != null && schoolId != null) {
            bulletins = bulletinRepository.findByClassroomIdAndAcademicYearIdAndSchoolId(classroomId, academicYearId, schoolId);
        } else {
            // ✅ Fallback robuste pour éviter de crasher l'interface utilisateur en cas d'absence de filtres
            bulletins = bulletinRepository.findByClassroomId(classroomId);
        }

        return bulletins.stream().map(b -> {
            Student s = b.getStudent();
            return StudentBulletinRowDTO.builder()
                    .studentId(s.getId())
                    .fullName(s.getFullName())
                    .gender(s.getGender().name())
                    .permanentNumber(s.getPermanentNumber())
                    .bulletinId(b.getId())
                    .status(b.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }
}