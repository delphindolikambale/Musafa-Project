package com.school.management.service.academicImpl;

import com.school.management.dto.academic.*;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.BulletinService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulletinServiceImpl implements BulletinService {

    private final CourseAssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentMarkRepository studentMarkRepository;

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
    public BulletinDataResponseDTO generateBulletin(Long studentId, Long academicYearId) {
        // 1. ✅ CORRECTION : Utilisation de la méthode multi-tenant native de EnrollmentRepository avec le schoolId
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearIdAndSchoolId(studentId, academicYearId, getCurrentSchoolId())
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée pour cet élève et cette année"));

        // ✅ SÉCURITÉ MULTI-TENANT : Validation de l'étanchéité du bulletin demandé
        if (!enrollment.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action refusée : Cet élève n'appartient pas à votre structure.");
        }

        // 2. ✅ CORRECTION : Appel de la méthode multi-tenant sécurisée avec injection du schoolId courant
        List<CourseAssignment> assignments = assignmentRepository.findByLevelIdAndAcademicYearIdAndSchoolId(
                enrollment.getClassroom().getLevel().getId(), academicYearId, getCurrentSchoolId());

        // 3. ✅ SÉCURISATION & OPTIMISATION MULTI-TENANT : Remplacement du .findAll() global par une sélection exclusive par élève
        List<StudentMark> studentMarks = studentMarkRepository.findByStudentId(studentId);

        // 4. Construction de l'arbre (Grouping par Domain -> SubDomain -> Subjects)
        List<DomainDTO> domains = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getSubject().getDomain()))
                .entrySet().stream().map(domainEntry -> {
                    Domain domain = domainEntry.getKey();

                    List<SubDomainDTO> subDomains = domainEntry.getValue().stream()
                            .collect(Collectors.groupingBy(a -> a.getSubject().getSubDomain()))
                            .entrySet().stream().map(subEntry -> {
                                SubDomain subDomain = subEntry.getKey();

                                List<SubjectGradeDTO> subjects = subEntry.getValue().stream().map(assign -> {

                                    // Calcul des notes par période sur la liste filtrée sécurisée
                                    double p1 = getMarkForTaskType(studentMarks, assign.getId(), "P1");
                                    double p2 = getMarkForTaskType(studentMarks, assign.getId(), "P2");
                                    double exam1 = getMarkForTaskType(studentMarks, assign.getId(), "EXAMEN1");

                                    double totalSemestre1 = p1 + p2 + exam1;
                                    double maxSemestre1 = assign.getMaxP1() + assign.getMaxP2() + assign.getMaxExam1();

                                    return SubjectGradeDTO.builder()
                                            .subjectName(assign.getSubject().getName())
                                            .p1(p1)
                                            .p2(p2)
                                            .examen1(exam1)
                                            .maxP1(assign.getMaxP1())
                                            .maxP2(assign.getMaxP2())
                                            .maxExamen1(assign.getMaxExam1())
                                            .totalSemestre1(totalSemestre1)
                                            .maxSemestre1(maxSemestre1)
                                            .build();
                                }).collect(Collectors.toList());

                                return SubDomainDTO.builder().name(subDomain.getName()).subjects(subjects).build();
                            }).collect(Collectors.toList());

                    return DomainDTO.builder().name(domain.getName()).subDomains(subDomains).build();
                }).collect(Collectors.toList());

        // 5. Retourner le bulletin construit avec le nom de classe dynamique
        return BulletinDataResponseDTO.builder()
                .student(StudentInfoDTO.builder()
                        .fullName(enrollment.getStudent().getFullName())
                        .matricule(enrollment.getStudent().getMatricule())
                        .className(enrollment.getClassroom().getDisplayName())
                        .build())
                .domains(domains)
                .build();
    }

    /**
     * Méthode utilitaire pour extraire la note selon le type de tâche.
     * Passage par TeacherAssignment pour atteindre le CourseAssignment
     */
    private double getMarkForTaskType(List<StudentMark> marks, Long assignmentId, String type) {
        return marks.stream()
                .filter(sm -> sm.getEvaluationTask().getTeacherAssignment().getCourseAssignment().getId().equals(assignmentId))
                .filter(sm -> sm.getEvaluationTask().getTitle().equalsIgnoreCase(type))
                .mapToDouble(StudentMark::getObtainedValue)
                .findFirst()
                .orElse(0.0);
    }
}