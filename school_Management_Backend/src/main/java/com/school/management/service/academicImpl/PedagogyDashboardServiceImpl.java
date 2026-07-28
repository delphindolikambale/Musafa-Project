package com.school.management.service.academicImpl;

import com.school.management.dto.academic.PedagogyDashboardDTO;
import com.school.management.dto.academic.RecentTeacherDTO;
import com.school.management.repository.academic.*;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.academic.PedagogyDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedagogyDashboardServiceImpl implements PedagogyDashboardService {

    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final FicheValidationRepository ficheValidationRepository;

    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            log.error("❌ Tentative d'accès au dashboard avec une session invalide ou anonyme.");
            throw new AccessDeniedException("Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        UserDetailsImpl user = getCurrentUser();

        // ✅ CORRECTION : Extraction robuste de l'ID pour éviter les erreurs de proxy Hibernate (LazyInitializationException)
        Long schoolId = user.getSchoolId();
        if (schoolId == null && user.getSchool() != null) {
            schoolId = user.getSchool().getId();
        }

        if (schoolId == null) {
            log.error("❌ Impossible de charger le dashboard : L'utilisateur {} n'est relié à aucun établissement.", user.getUsername());
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return schoolId;
    }

    @Override
    public PedagogyDashboardDTO getPedagogyStatistics() {
        Long schoolId = getCurrentSchoolId();
        log.info("📊 Calcul des statistiques du Dashboard Pédagogique pour l'école ID: {}", schoolId);

        // 1. CARTE 1 : Nombre total des enseignants (Hommes / Femmes)
        long totalTeachers = teacherRepository.countBySchoolId(schoolId);
        long totalMaleTeachers = teacherRepository.countByGenderIgnoreCaseAndSchoolId("M", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Masculin", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Homme", schoolId);

        long totalFemaleTeachers = teacherRepository.countByGenderIgnoreCaseAndSchoolId("F", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Féminin", schoolId)
                + teacherRepository.countByGenderIgnoreCaseAndSchoolId("Femme", schoolId);

        // 2. CARTE 2 : Nombre de classes actives
        long totalActiveClasses = classroomRepository.countBySchoolIdAndActiveTrue(schoolId);

        // 3. CARTE 3 : Nombre de cours déjà enregistrés dans le système
        long totalRegisteredCourses = subjectRepository.countBySchoolId(schoolId);

        // 4. CARTE 4 : Nombre de cours déjà affectés aux enseignants
        long totalAssignedCourses = teacherAssignmentRepository.countDistinctAssignedCoursesBySchoolId(schoolId);

        // 5. CARTE 5 : Nombre total des fiches de notes reçues
        long totalGradeSheetsReceived = ficheValidationRepository.countBySchoolId(schoolId);

        // 6. BLOC : Derniers enseignants enregistrés dans l'établissement
        List<RecentTeacherDTO> recentTeachers = teacherRepository.findTop5BySchoolIdOrderByIdDesc(schoolId)
                .stream()
                .map(teacher -> RecentTeacherDTO.builder()
                        .id(teacher.getId())
                        .registrationNumber(teacher.getSchoolRegistrationNumber())
                        .fullName(teacher.getFullName())
                        .gender(teacher.getGender())
                        .speciality(teacher.getDomainSpeciality() != null ? teacher.getDomainSpeciality().getName() : "Général")
                        .phone(teacher.getPhoneNumber())
                        .active(teacher.isActive())
                        .build())
                .collect(Collectors.toList());

        log.info("✅ Dashboard chargé avec succès. Enseignants trouvés: {}, Classes actives: {}", totalTeachers, totalActiveClasses);

        return PedagogyDashboardDTO.builder()
                .totalTeachers(totalTeachers)
                .totalMaleTeachers(totalMaleTeachers)
                .totalFemaleTeachers(totalFemaleTeachers)
                .totalActiveClasses(totalActiveClasses)
                .totalRegisteredCourses(totalRegisteredCourses)
                .totalAssignedCourses(totalAssignedCourses)
                .totalGradeSheetsReceived(totalGradeSheetsReceived)
                .recentTeachers(recentTeachers)
                .build();
    }
}