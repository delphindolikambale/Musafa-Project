package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.dto.academic.GridSubjectRequestDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.SubjectService;
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

    @Override
    @Transactional
    public SubjectResponseDTO createSubject(SubjectRequestDTO dto) {
        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        SubDomain subDomain;

        if (dto.getSubDomainId() == null) {
            subDomain = getOrCreateTechnicalSubDomain(domain, dto);
        } else {
            subDomain = subDomainRepository.findById(dto.getSubDomainId())
                    .orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

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
                .build();

        return mapToResponse(subjectRepository.save(subject));
    }

    /**
     * ✅ MÉTHODE ADAPTÉE : Sauvegarde de la grille matricielle sans obligation d'année académique.
     * Le backend récupère l'année active automatiquement.
     */
    @Override
    @Transactional
    public void saveBulkGrid(GridSubjectRequestDTO dto) {
        // ADAPTATION : Récupération automatique de l'année active si l'ID n'est pas fourni.
        AcademicYear year;
        if (dto.getAcademicYearId() != null) {
            year = academicYearRepository.findById(dto.getAcademicYearId())
                    .orElseThrow(() -> new RuntimeException("Année introuvable"));
        } else {
            year = academicYearRepository.findByActiveTrue()
                    .orElseThrow(() -> new IllegalArgumentException("Aucune année académique active n'a été trouvée."));
        }

        // Gestion du Cycle de Base
        Section section = dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null;
        Option option = dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null;

        for (GridSubjectRequestDTO.GridCourseDTO courseDTO : dto.getCourses()) {

            Domain domain = null;
            if (courseDTO.getDomainId() != null) {
                domain = domainRepository.findById(courseDTO.getDomainId()).orElse(null);
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

                    // ADAPTATION : Recherche avec l'ID de l'année active
                    Subject existingSubject = subjectRepository.findByClassContext(
                                    levelId, section != null ? section.getId() : null, option != null ? option.getId() : null, year.getId())
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
                                .academicYear(year) // Année active injectée ici
                                .section(section)
                                .option(option)
                                .category(courseDTO.getCategory())
                                .hoursPerWeek(hours)
                                .build();
                        subjectRepository.save(newSubject);
                    }
                }
            }
        }
    }

    private SubDomain getOrCreateTechnicalSubDomainForGrid(Domain domain, Long levelId, Long sectionId, Long optionId, Long yearId) {
        return subDomainRepository.findByClassContext(levelId, sectionId, optionId, yearId)
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
                            .build();
                    return subDomainRepository.save(techSd);
                });
    }

    private SubDomain getOrCreateTechnicalSubDomain(Domain domain, SubjectRequestDTO dto) {
        return subDomainRepository.findByClassContext(
                        dto.getLevelId(), dto.getSectionId(), dto.getOptionId(), dto.getAcademicYearId())
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
                            .build();
                    return subDomainRepository.save(techSd);
                });
    }

    @Override
    @Transactional
    public SubjectResponseDTO updateSubject(Long id, SubjectRequestDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        SubDomain subDomain = (dto.getSubDomainId() == null)
                ? getOrCreateTechnicalSubDomain(domain, dto)
                : subDomainRepository.findById(dto.getSubDomainId()).orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

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
        subjectRepository.delete(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getSubjectsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        return subjectRepository.findByClassContext(levelId, sectionId, optionId, yearId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getSubjectsForConnectedStudent(Long userId) {
        try {
            Enrollment enrollment = entityManager.createQuery(
                            "SELECT e FROM Enrollment e WHERE e.student.user.id = :userId AND e.active = true", Enrollment.class)
                    .setParameter("userId", userId)
                    .getSingleResult();

            Classroom classroom = enrollment.getClassroom();
            AcademicYear year = enrollment.getAcademicYear();

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null && attributes.getResponse() != null) {
                attributes.getResponse().addHeader("X-Classroom-Display-Name", classroom.getDisplayName());
                attributes.getResponse().addHeader("Access-Control-Expose-Headers", "X-Classroom-Display-Name");
            }

            List<Object[]> results = entityManager.createQuery(
                            "SELECT ca, ta FROM CourseAssignment ca " +
                                    "LEFT JOIN TeacherAssignment ta ON ta.courseAssignment = ca AND ta.classroom.id = :classroomId " +
                                    "WHERE ca.level.id = :levelId " +
                                    "AND (ca.section.id = :sectionId OR (ca.section IS NULL AND :sectionId IS NULL)) " +
                                    "AND (ca.option.id = :optionId OR (ca.option IS NULL AND :optionId IS NULL)) " +
                                    "AND ca.academicYear.id = :yearId", Object[].class)
                    .setParameter("classroomId", classroom.getId())
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

    // ADAPTATION MAJEURE : Injection explicite des métadonnées contextuelles de niveau, section et option.
    // Sans ces éléments, le composant graphique React reçoit une liste brute de cours sans savoir à quelle colonne les relier.
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