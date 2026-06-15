package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collections;
import java.util.List;
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
                .build();

        return mapToResponse(subjectRepository.save(subject));
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
            // 1. Récupérer l'inscription active de l'élève
            Enrollment enrollment = entityManager.createQuery(
                            "SELECT e FROM Enrollment e WHERE e.student.user.id = :userId AND e.active = true", Enrollment.class)
                    .setParameter("userId", userId)
                    .getSingleResult();

            Classroom classroom = enrollment.getClassroom();
            AcademicYear year = enrollment.getAcademicYear();

            // Gestion en-tête
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null && attributes.getResponse() != null) {
                attributes.getResponse().addHeader("X-Classroom-Display-Name", classroom.getDisplayName());
                attributes.getResponse().addHeader("Access-Control-Expose-Headers", "X-Classroom-Display-Name");
            }

            // 2. CORRECTION : Jointure externe (LEFT JOIN) pour récupérer TOUS les cours (CourseAssignment)
            // de la classe, et optionnellement l'enseignant (TeacherAssignment) s'il y en a un.
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

            // Mappage des résultats
            return results.stream().map(result -> {
                CourseAssignment ca = (CourseAssignment) result[0];
                TeacherAssignment ta = (TeacherAssignment) result[1]; // Peut être null
                Subject s = ca.getSubject();

                return SubjectResponseDTO.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                        .domainName(s.getDomain() != null ? s.getDomain().getName() : null)
                        // CORRECTION : Mappage du sous-domaine ajouté ici
                        .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                        .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : null)
                        // Détails TeacherAssignment (sécurisé contre les valeurs nulles)
                        .teacherFullName(ta != null && ta.getTeacher() != null ? ta.getTeacher().getFullName() : "Non attribué")
                        .weeklyHours(ta != null ? ta.getWeeklyHours() : 0.0)
                        // Maximas
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
    // Mapper basique pour création/mise à jour classique
    private SubjectResponseDTO mapToResponse(Subject s) {
        return SubjectResponseDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                .domainName(s.getDomain() != null ? s.getDomain().getName() : null)
                .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : null)
                .build();
    }
}