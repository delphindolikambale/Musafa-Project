package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DashboardDTO;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.service.academic.DashboardService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Injection automatique via Lombok
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    /**
     * ✅ EXTRACTION DU CONTEXTE MULTI-TENANT SÉCURISÉ
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
    public DashboardDTO getGlobalStatistics() {
        Long schoolId = getCurrentSchoolId();

        // ✅ MULTI-TENANT : Comptage restreint aux frontières de l'école connectée
        return DashboardDTO.builder()
                .totalStudents(studentRepository.countBySchoolId(schoolId))
                .totalTeachers(48) // Valeur temporaire conservée selon votre code métier d'origine
                .totalClasses(classroomRepository.countBySchoolId(schoolId))
                .recoveryRate(85.0)
                .build();
    }
}