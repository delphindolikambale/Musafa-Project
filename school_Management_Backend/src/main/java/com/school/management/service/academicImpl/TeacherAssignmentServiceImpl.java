package com.school.management.service.academicImpl;

import com.school.management.dto.academic.TeacherAssignmentRequestDTO;
import com.school.management.dto.academic.TeacherAssignmentResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.TeacherAssignmentService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherAssignmentServiceImpl implements TeacherAssignmentService {

    private final TeacherAssignmentRepository repository;
    private final TeacherRepository teacherRepository;
    private final CourseAssignmentRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final AcademicYearRepository yearRepository;

    private final EnrollmentRepository enrollmentRepository;
    private final EvaluationTaskRepository evaluationTaskRepository;
    private final StudentMarkRepository markRepository;

    /**
     * ✅ MÉTHODE UTILITAIRE MULTI-TENANT
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
            throw new IllegalStateException("L'utilisateur actuel n'est rattaché à aucune école active.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public TeacherAssignmentResponseDTO assignTeacher(TeacherAssignmentRequestDTO dto) {
        // ✅ ISOLATION DES CLÉS UNIQUES PAR ÉCOLE
        repository.findByCourseAssignmentIdAndClassroomIdAndSchoolId(dto.getCourseAssignmentId(), dto.getClassroomId(), getCurrentSchoolId())
                .ifPresent(a -> { throw new RuntimeException("Ce cours est déjà attribué à un autre enseignant dans cette classe."); });

        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        CourseAssignment course = courseRepository.findById(dto.getCourseAssignmentId())
                .orElseThrow(() -> new RuntimeException("Configuration de cours non trouvée"));

        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));

        AcademicYear year = yearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée"));

        // ✅ SÉCURITÉ MULTI-TENANT : Vérification de la légitimité des liaisons soumises
        if (!course.getSchool().getId().equals(getCurrentSchoolId()) || !year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Opération refusée : Tentative de liaison avec des entités d'un autre établissement.");
        }

        TeacherAssignment assignment = TeacherAssignment.builder()
                .teacher(teacher)
                .courseAssignment(course)
                .classroom(classroom)
                .academicYear(year)
                .weeklyHours(dto.getWeeklyHours())
                .isClassMaster(dto.isClassMaster())
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Injection automatique
                .build();

        return mapToDTO(repository.save(assignment));
    }

    @Override
    @Transactional
    public void importAssignmentsFromPreviousYear(Long sourceYearId, Long targetYearId) {
        AcademicYear targetYear = yearRepository.findById(targetYearId)
                .orElseThrow(() -> new RuntimeException("Année cible non trouvée"));

        if (!targetYear.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Opération refusée : L'année cible n'appartient pas à votre établissement.");
        }

        // ✅ RECHERCHE ISOLÉE DE L'ANCIENNE CONFIGURATION PAR SCHOOL_ID
        List<TeacherAssignment> sourceAssignments = repository.findByAcademicYearIdAndSchoolId(sourceYearId, getCurrentSchoolId());

        for (TeacherAssignment source : sourceAssignments) {
            CourseAssignment srcConfig = source.getCourseAssignment();

            String subjectName = srcConfig.getSubject().getName();
            String levelName = srcConfig.getLevel().getName();
            String sectionName = srcConfig.getSection() != null ? srcConfig.getSection().getSectionName() : null;
            String optionName = srcConfig.getOption() != null ? srcConfig.getOption().getOptionName() : null;

            // ✅ AJOUT PARAMÈTRE DU TENANT
            Optional<CourseAssignment> targetConfigOpt = courseRepository.findByLogicalKeyInYear(
                    subjectName, levelName, sectionName, optionName, targetYearId, getCurrentSchoolId()
            );

            if (targetConfigOpt.isPresent()) {
                CourseAssignment targetConfig = targetConfigOpt.get();

                boolean alreadyExists = repository.findByCourseAssignmentIdAndClassroomIdAndSchoolId(
                        targetConfig.getId(), source.getClassroom().getId(), getCurrentSchoolId()).isPresent();

                if (!alreadyExists) {
                    TeacherAssignment newAssignment = TeacherAssignment.builder()
                            .teacher(source.getTeacher())
                            .courseAssignment(targetConfig)
                            .classroom(source.getClassroom())
                            .academicYear(targetYear)
                            .weeklyHours(source.getWeeklyHours())
                            .isClassMaster(source.isClassMaster())
                            .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Clonage sécurisé
                            .build();

                    repository.save(newAssignment);
                }
            }
        }
    }

    @Override
    @Transactional
    public TeacherAssignmentResponseDTO updateAssignment(Long id, TeacherAssignmentRequestDTO dto) {
        TeacherAssignment existingAssignment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable avec l'ID : " + id));

        // ✅ SÉCURITÉ MULTI-TENANT : Vérification avant mise à jour
        if (!existingAssignment.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Modification refusée : Cette affectation n'appartient pas à votre école.");
        }

        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        CourseAssignment course = courseRepository.findById(dto.getCourseAssignmentId())
                .orElseThrow(() -> new RuntimeException("Configuration de cours non trouvée"));

        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));

        AcademicYear year = yearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année académique non trouvée"));

        if (!course.getSchool().getId().equals(getCurrentSchoolId()) || !year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Modification refusée : Les nouvelles données cibles violent l'isolation multi-tenant.");
        }

        existingAssignment.setTeacher(teacher);
        existingAssignment.setCourseAssignment(course);
        existingAssignment.setClassroom(classroom);
        existingAssignment.setAcademicYear(year);
        existingAssignment.setWeeklyHours(dto.getWeeklyHours());
        existingAssignment.setClassMaster(dto.isClassMaster());

        return mapToDTO(repository.save(existingAssignment));
    }

    @Override
    public List<TeacherAssignmentResponseDTO> getAssignmentsByClass(Long classroomId, Long yearId) {
        // ✅ ISOLATION DU READ
        return repository.findByClassroomIdAndAcademicYearIdAndSchoolId(classroomId, yearId, getCurrentSchoolId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TeacherAssignmentResponseDTO> getAssignmentsByTeacher(Long teacherId, Long yearId) {
        // ✅ ISOLATION DU READ
        return repository.findByTeacherIdAndAcademicYearIdAndSchoolId(teacherId, yearId, getCurrentSchoolId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAssignment(Long id) {
        TeacherAssignment existingAssignment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable avec l'ID : " + id));

        // ✅ SÉCURITÉ MULTI-TENANT : Vérification de la propriété avant suppression
        if (!existingAssignment.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Suppression refusée : Cette affectation n'appartient pas à votre école.");
        }
        repository.delete(existingAssignment);
    }

    @Override
    public TeacherAssignmentResponseDTO getAssignmentById(Long id) {
        TeacherAssignment assignment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable avec l'ID : " + id));

        // ✅ SÉCURITÉ MULTI-TENANT
        if (!assignment.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Consultation refusée : Cette affectation n'appartient pas à votre école.");
        }
        return mapToDTO(assignment);
    }

    @Override
    public double getCourseSuccessRate(Long teacherAssignmentId) {
        TeacherAssignment ta = repository.findById(teacherAssignmentId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        // ✅ VÉRIFICATION MULTI-TENANT STATISTIQUES
        if (!ta.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Calcul du taux de réussite interdit : Données hors périmètre d'accès.");
        }

        // 1. Récupérer tous les élèves actifs inscrits dans cette classe
        List<Enrollment> enrollments = enrollmentRepository.findByClassroomIdAndAcademicYearIdAndSchoolIdAndActiveTrue(
                ta.getClassroom().getId(), ta.getAcademicYear().getId(), getCurrentSchoolId());

        if (enrollments.isEmpty()) {
            return 0.0;
        }

        // 2. Récupérer toutes les évaluations créées pour cette affectation
        List<EvaluationTask> tasks = evaluationTaskRepository.findByTeacherAssignmentIdAndSchoolId(teacherAssignmentId, getCurrentSchoolId());
        if (tasks.isEmpty()) {
            return 0.0;
        }

        // 3. Calculer la somme globale des maxima de toutes les épreuves déjà planifiées
        double totalMaxPoints = tasks.stream().mapToDouble(EvaluationTask::getMaxPoints).sum();
        if (totalMaxPoints == 0) {
            return 0.0;
        }

        long passingStudentsCount = 0;

        // 4. Parcourir les élèves pour calculer leur cumul personnel et vérifier la moyenne
        for (Enrollment enrollment : enrollments) {
            Long studentId = enrollment.getStudent().getId();

            double totalObtained = markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, teacherAssignmentId)
                    .stream()
                    .mapToDouble(StudentMark::getObtainedValue)
                    .sum();

            // Un élève valide le cours s'il obtient la moitié ou plus des points mis en jeu
            if (totalObtained >= (totalMaxPoints / 2.0)) {
                passingStudentsCount++;
            }
        }

        // 5. Calculer le pourcentage final de réussite
        return (double) passingStudentsCount * 100.0 / enrollments.size();
    }

    private TeacherAssignmentResponseDTO mapToDTO(TeacherAssignment entity) {
        return TeacherAssignmentResponseDTO.builder()
                .id(entity.getId())
                .teacherId(entity.getTeacher().getId())
                .teacherFullName(entity.getTeacher().getFirstName() + " " + entity.getTeacher().getLastName())
                .teacherMatricule(entity.getTeacher().getSchoolRegistrationNumber()) // ✅ AJOUT : Liaison indispensable du matricule
                .courseAssignmentId(entity.getCourseAssignment().getId())
                .subjectId(entity.getCourseAssignment().getSubject().getId()) // ✅ AJOUT : Corrige la valeur 'null' renvoyée dans la console
                .subjectName(entity.getCourseAssignment().getSubject().getName())
                .classroomId(entity.getClassroom().getId())
                .classroomName(entity.getClassroom().getDisplayName())
                .weeklyHours(entity.getWeeklyHours())
                .isClassMaster(entity.isClassMaster())
                .academicYear(entity.getAcademicYear().getAnnee())
                .build();
    }
}