package com.school.management.service.academicImpl;

import com.school.management.dto.academic.*;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.BulletinService;
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

    @Override
    public BulletinDataResponseDTO generateBulletin(Long studentId, Long academicYearId) {
        // 1. Récupérer inscription et classe avec orElseThrow pour gérer l'Optional
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearId(studentId, academicYearId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée pour cet élève et cette année"));

        // 2. Récupérer toutes les assignations de la classe
        List<CourseAssignment> assignments = assignmentRepository.findByLevelIdAndAcademicYearId(
                enrollment.getClassroom().getLevel().getId(), academicYearId);

        // 3. Récupérer toutes les notes de l'élève pour cette année
        List<StudentMark> allMarks = studentMarkRepository.findAll();

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

                                    // Calcul des notes par période
                                    double p1 = getMarkForTaskType(allMarks, assign.getId(), "P1");
                                    double p2 = getMarkForTaskType(allMarks, assign.getId(), "P2");
                                    double exam1 = getMarkForTaskType(allMarks, assign.getId(), "EXAMEN1");

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
     * 🔥 CORRECTION : Passage par TeacherAssignment pour atteindre le CourseAssignment
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