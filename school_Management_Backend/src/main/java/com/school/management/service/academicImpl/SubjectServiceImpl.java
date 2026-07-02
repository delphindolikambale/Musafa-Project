package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.dto.academic.GridSubjectRequestDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.SubjectService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * ✅ MÉTHODE UTILITAIRE PRIVÉE SÉCURISÉE
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session utilisateur invalide ou expirée. Veuillez vous reconnecter.");
        }
        return (UserDetailsImpl) principal;
    }

    /**
     * ✅ MÉTHODE UTILITAIRE PRIVÉE
     */
    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("Action impossible : Votre compte utilisateur n'est rattaché à aucune école.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public SubjectResponseDTO createSubject(SubjectRequestDTO dto) {
        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ce domaine n'appartient pas à votre établissement.");
        }

        SubDomain subDomain;

        if (dto.getSubDomainId() == null) {
            subDomain = getOrCreateTechnicalSubDomain(domain, dto);
        } else {
            subDomain = subDomainRepository.findById(dto.getSubDomainId())
                    .orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));

            // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
            if (!subDomain.getSchool().getId().equals(getCurrentSchoolId())) {
                throw new AccessDeniedException("❌ Action interdite : Ce sous-domaine n'appartient pas à votre établissement.");
            }
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

        // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
        if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique spécifiée n'appartient pas à votre établissement.");
        }

        Subject subject = Subject.builder()
                .name(dto.getName())
                .domain(domain)
                .subDomain(subDomain)
                .level(level)
                .academicYear(year)
                .section(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null)
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .category(dto.getCategory())
                .hoursPerWeek(dto.getHoursPerWeek())
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Injection directe de l'école
                .build();

        return mapToResponse(subjectRepository.save(subject));
    }

    /**
     * ✅ MÉTHODE ADAPTÉE MULTI-TENANT : Sauvegarde de la grille matricielle isolée par école.
     */
    @Override
    @Transactional
    public void saveBulkGrid(GridSubjectRequestDTO dto) {
        AcademicYear year;
        if (dto.getAcademicYearId() != null) {
            year = academicYearRepository.findById(dto.getAcademicYearId())
                    .orElseThrow(() -> new RuntimeException("Année introuvable"));

            // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
            if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
                throw new AccessDeniedException("❌ Action interdite : L'année spécifiée n'appartient pas à votre établissement.");
            }
        } else {
            // ✅ MULTI-TENANT : Isolation de la recherche de l'année active propre à l'école connectée
            year = academicYearRepository.findByActiveTrueAndSchoolId(getCurrentSchoolId())
                    .orElseThrow(() -> new IllegalArgumentException("Aucune année académique active n'a été trouvée pour votre établissement."));
        }

        // Gestion du Cycle de Base
        Section section = dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null;
        Option option = dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null;

        for (GridSubjectRequestDTO.GridCourseDTO courseDTO : dto.getCourses()) {

            Domain domain = null;
            if (courseDTO.getDomainId() != null) {
                domain = domainRepository.findById(courseDTO.getDomainId()).orElse(null);

                // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
                if (domain != null && !domain.getSchool().getId().equals(getCurrentSchoolId())) {
                    throw new AccessDeniedException("❌ Action interdite : Le domaine référencé n'appartient pas à votre établissement.");
                }
            }

            for (Map.Entry<Long, Double> entry : courseDTO.getLevelHours().entrySet()) {
                Long levelId = entry.getKey();
                Double hours = entry.getValue();

                if (levelId == null) {
                    continue;
                }

                if (hours != null && hours > 0) {
                    Level level = levelRepository.findById(levelId)
                            .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

                    // ✅ MULTI-TENANT : Utilisation du dépôt adapté avec le paramètre de l'école active
                    Subject existingSubject = subjectRepository.findByClassContext(
                                    levelId, section != null ? section.getId() : null, option != null ? option.getId() : null, year.getId(), getCurrentSchoolId())
                            .stream()
                            .filter(s -> s.getName().equalsIgnoreCase(courseDTO.getName().trim()))
                            .findFirst()
                            .orElse(null);

                    if (existingSubject != null) {
                        existingSubject.setHoursPerWeek(hours);
                        subjectRepository.save(existingSubject);
                    } else {
                        Subject newSubject = Subject.builder()
                                .name(courseDTO.getName().trim())
                                .domain(domain)
                                .subDomain(null)
                                .level(level)
                                .academicYear(year)
                                .section(section)
                                .option(option)
                                .category(courseDTO.getCategory())
                                .hoursPerWeek(hours)
                                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Rattachement à l'école
                                .build();
                        subjectRepository.save(newSubject);
                    }
                }
            }
        }
    }

    private SubDomain getOrCreateTechnicalSubDomainForGrid(Domain domain, Long levelId, Long sectionId, Long optionId, Long yearId) {
        // ✅ MULTI-TENANT : Utilisation du dépôt adapté avec le paramètre de l'école active
        return subDomainRepository.findByClassContext(levelId, sectionId, optionId, yearId, getCurrentSchoolId())
                .stream()
                .filter(sd -> sd.getName().equalsIgnoreCase(domain.getName()))
                .findFirst()
                .orElseGet(() -> {
                    SubDomain techSd = SubDomain.builder()
                            .name(domain.getName())
                            .domain(domain)
                            .level(levelRepository.findById(levelId).orElse(null))
                            .section(sectionId != null ? sectionRepository.findById(sectionId).orElse(null) : null)
                            .option(optionId != null ? optionRepository.findById(optionId).orElse(null) : null)
                            .academicYear(academicYearRepository.findById(yearId).orElse(null))
                            .orderIndex(0)
                            .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Rattachement à l'école
                            .build();
                    return subDomainRepository.save(techSd);
                });
    }

    private SubDomain getOrCreateTechnicalSubDomain(Domain domain, SubjectRequestDTO dto) {
        // ✅ MULTI-TENANT : Utilisation du dépôt adapté avec le paramètre de l'école active
        return subDomainRepository.findByClassContext(
                        dto.getLevelId(), dto.getSectionId(), dto.getOptionId(), dto.getAcademicYearId(), getCurrentSchoolId())
                .stream()
                .filter(sd -> sd.getName().equalsIgnoreCase(domain.getName()))
                .findFirst()
                .orElseGet(() -> {
                    SubDomain techSd = SubDomain.builder()
                            .name(domain.getName())
                            .domain(domain)
                            .level(domain.getLevel())
                            .section(domain.getSection())
                            .option(domain.getOption())
                            .academicYear(domain.getAcademicYear())
                            .orderIndex(0)
                            .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Rattachement à l'école
                            .build();
                    return subDomainRepository.save(techSd);
                });
    }

    @Override
    @Transactional
    public SubjectResponseDTO updateSubject(Long id, SubjectRequestDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
        if (!subject.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Cette matière n'appartient pas à votre établissement.");
        }

        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Le domaine cible n'appartient pas à votre établissement.");
        }

        SubDomain subDomain = (dto.getSubDomainId() == null)
                ? getOrCreateTechnicalSubDomain(domain, dto)
                : subDomainRepository.findById(dto.getSubDomainId()).orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));

        if (!subDomain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Le sous-domaine cible n'appartient pas à votre établissement.");
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

        if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique cible n'appartient pas à votre établissement.");
        }

        subject.setName(dto.getName());
        subject.setDomain(domain);
        subject.setSubDomain(subDomain);
        subject.setLevel(level);
        subject.setAcademicYear(year);
        subject.setSection(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null);
        subject.setOption(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null);
        subject.setCategory(dto.getCategory());
        subject.setHoursPerWeek(dto.getHoursPerWeek());

        return mapToResponse(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : Matière introuvable"));

        // ✅ CONTRÔLE DE SÉCURITÉ MULTI-TENANT
        if (!subject.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Cette matière n'appartient pas à votre établissement.");
        }
        subjectRepository.delete(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getSubjectsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        // ✅ MULTI-TENANT : Filtrage strict par l'école connectée
        return subjectRepository.findByClassContext(levelId, sectionId, optionId, yearId, getCurrentSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getAllSubjects() {
        // ✅ MULTI-TENANT : Liste globale restreinte à l'école de la session
        return subjectRepository.findAllBySchoolId(getCurrentSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getSubjectsForConnectedStudent(Long userId) {
        try {
            // ✅ MULTI-TENANT : Isolation de l'inscription de l'élève par l'école active
            Enrollment enrollment = entityManager.createQuery(
                            "SELECT e FROM Enrollment e WHERE e.student.user.id = :userId AND e.active = true AND e.classroom.school.id = :schoolId", Enrollment.class)
                    .setParameter("userId", userId)
                    .setParameter("schoolId", getCurrentSchoolId())
                    .getSingleResult();

            Classroom classroom = enrollment.getClassroom();
            AcademicYear year = enrollment.getAcademicYear();

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null && attributes.getResponse() != null) {
                attributes.getResponse().addHeader("X-Classroom-Display-Name", classroom.getDisplayName());
                attributes.getResponse().addHeader("Access-Control-Expose-Headers", "X-Classroom-Display-Name");
            }

            // ✅ MULTI-TENANT : Ajout du verrou strict ca.school.id = :schoolId dans la requête globale
            List<Object[]> results = entityManager.createQuery(
                            "SELECT ca, ta FROM CourseAssignment ca " +
                                    "LEFT JOIN TeacherAssignment ta ON ta.courseAssignment = ca AND ta.classroom.id = :classroomId " +
                                    "WHERE ca.school.id = :schoolId " +
                                    "AND ca.level.id = :levelId " +
                                    "AND (ca.section.id = :sectionId OR (ca.section IS NULL AND :sectionId IS NULL)) " +
                                    "AND (ca.option.id = :optionId OR (ca.option IS NULL AND :optionId IS NULL)) " +
                                    "AND ca.academicYear.id = :yearId", Object[].class)
                    .setParameter("classroomId", classroom.getId())
                    .setParameter("schoolId", getCurrentSchoolId())
                    .setParameter("levelId", classroom.getLevel().getId())
                    .setParameter("sectionId", classroom.getSection() != null ? classroom.getSection().getId() : null)
                    .setParameter("optionId", classroom.getOption() != null ? classroom.getOption().getId() : null)
                    .setParameter("yearId", year.getId())
                    .getResultList();

            return results.stream().map(result -> {
                CourseAssignment ca = (CourseAssignment) result[0];
                TeacherAssignment ta = (TeacherAssignment) result[1];
                Subject s = ca.getSubject();

                return SubjectResponseDTO.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                        .domainName(s.getDomain() != null ? s.getDomain().getName() : null)
                        .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                        .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : null)
                        .category(s.getCategory())
                        .hoursPerWeek(s.getHoursPerWeek() != null ? s.getHoursPerWeek() : 0.0)
                        .teacherFullName(ta != null && ta.getTeacher() != null ? ta.getTeacher().getFullName() : "Non attribué")
                        .weeklyHours(ta != null ? ta.getWeeklyHours() : 0.0)
                        .maxP1(ca.getMaxP1())
                        .maxP2(ca.getMaxP2())
                        .maxExam1(ca.getMaxExam1())
                        .maxP3(ca.getMaxP3())
                        .maxP4(ca.getMaxP4())
                        .maxExam2(ca.getMaxExam2())
                        .maxS1(ca.getMaxS1())
                        .maxS2(ca.getMaxS2())
                        .maxTotal(ca.getMaxTotal())
                        .build();
            }).collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private SubjectResponseDTO mapToResponse(Subject s) {
        return SubjectResponseDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                .domainName(s.getDomain() != null ? s.getDomain().getName() : null)
                .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : null)
                .category(s.getCategory())
                .hoursPerWeek(s.getHoursPerWeek() != null ? s.getHoursPerWeek() : 0.0)
                .levelId(s.getLevel() != null ? s.getLevel().getId() : null)
                .levelName(s.getLevel() != null ? s.getLevel().getName() : null)
                .sectionId(s.getSection() != null ? s.getSection().getId() : null)
                .optionId(s.getOption() != null ? s.getOption().getId() : null)
                .build();
    }
}