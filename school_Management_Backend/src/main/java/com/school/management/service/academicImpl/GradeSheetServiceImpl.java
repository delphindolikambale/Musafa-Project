package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;
import com.school.management.dto.academic.StudentRowDTO;
import com.school.management.dto.academic.SubjectGradeDTO;
import com.school.management.model.academic.*;
import com.school.management.model.enums.EvaluationType;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.GradeSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class GradeSheetServiceImpl implements GradeSheetService {

    private final EnrollmentRepository enrollmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentMarkRepository markRepository;

    @Override
    public GradeSheetResponseDTO generateStudentGradeSheet(Long studentId, Long yearId, int semester) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndAcademicYearId(studentId, yearId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByClassroomIdAndAcademicYearId(enrollment.getClassroom().getId(), yearId);

        List<SubjectGradeDTO> grades = new ArrayList<>();
        double totalObtained = 0;
        double totalMax = 0;

        for (TeacherAssignment ta : assignments) {
            CourseAssignment config = ta.getCourseAssignment();

            double p1Score = sumMarks(studentId, ta.getId(), 1);
            double p2Score = sumMarks(studentId, ta.getId(), 2);
            double exam1Score = sumMarksByType(studentId, ta.getId(), EvaluationType.EXAMEN, 1); // Semestre 1

            SubjectGradeDTO row = SubjectGradeDTO.builder()
                    .subjectName(config.getSubject().getName())
                    .p1(p1Score).maxP1(config.getMaxP1())
                    .p2(p2Score).maxP2(config.getMaxP2())
                    .examen1(exam1Score).maxExamen1(config.getMaxExam1())
                    .totalSemestre1(p1Score + p2Score + exam1Score)
                    .maxSemestre1(config.getMaxS1())
                    .build();

            grades.add(row);
            totalObtained += row.getTotalSemestre1();
            totalMax += row.getMaxSemestre1();
        }

        return GradeSheetResponseDTO.builder()
                .studentName(enrollment.getStudent().getFullName())
                .classroomName(enrollment.getClassroom().getDisplayName())
                .academicYear(enrollment.getAcademicYear().getAnnee())
                .subjectGrades(grades)
                .grandTotalObtained(totalObtained)
                .grandTotalMax(totalMax)
                .percentage(totalMax > 0 ? (totalObtained * 100) / totalMax : 0)
                .build();
    }

    // --- NOUVELLE METHODE POUR LA MATRICE DE LA CLASSE (Image 2) ---
    @Override
    public ClassGradeSheetResponseDTO generateClassGradeSheet(Long taId) {
        TeacherAssignment ta = teacherAssignmentRepository.findById(taId)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée"));

        CourseAssignment config = ta.getCourseAssignment();

        // Récupérer tous les élèves inscrits dans cette classe pour cette année
        List<Enrollment> enrollments = enrollmentRepository.findByClassroomIdAndAcademicYearIdAndActiveTrue(
                ta.getClassroom().getId(), ta.getAcademicYear().getId());

        List<StudentRowDTO> studentRows = new ArrayList<>();

        for (Enrollment e : enrollments) {
            Long studentId = e.getStudent().getId();

            // Calcul Semestre 1
            double p1 = sumMarks(studentId, taId, 1);
            double p2 = sumMarks(studentId, taId, 2);
            double exam1 = sumMarksByType(studentId, taId, EvaluationType.EXAMEN, 1);
            double ts1 = p1 + p2 + exam1;

            // Calcul Semestre 2
            double p3 = sumMarks(studentId, taId, 3);
            double p4 = sumMarks(studentId, taId, 4);
            double exam2 = sumMarksByType(studentId, taId, EvaluationType.EXAMEN, 2);
            double ts2 = p3 + p4 + exam2;

            double totalGen = ts1 + ts2;

            studentRows.add(StudentRowDTO.builder()
                    .studentId(studentId)
                    .matricule(e.getStudent().getMatricule())
                    .fullName(e.getStudent().getFullName())
                    .gender(e.getStudent().getGender().name())
                    .p1(p1).p2(p2).exam1(exam1).totalS1(ts1)
                    .p3(p3).p4(p4).exam2(exam2).totalS2(ts2)
                    .totalGeneral(totalGen)
                    .build());
        }

        return ClassGradeSheetResponseDTO.builder()
                .teacherAssignmentId(taId)
                .subjectName(config.getSubject().getName())
                .classroomName(ta.getClassroom().getDisplayName())
                .maxP1(config.getMaxP1()).maxP2(config.getMaxP2()).maxExam1(config.getMaxExam1()).maxS1(config.getMaxS1())
                .maxP3(config.getMaxP3()).maxP4(config.getMaxP4()).maxExam2(config.getMaxExam2()).maxS2(config.getMaxS2())
                .maxTotalGeneral(config.getMaxTotal())
                .students(studentRows)
                .build();
    }

    private double sumMarks(Long studentId, Long taId, int period) {
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, taId)
                .stream()
                .filter(m -> m.getEvaluationTask().getPeriod() == period)
                // Exclure les examens s'ils ont été enregistrés avec la même période, car ils ont leur propre type
                .filter(m -> m.getEvaluationTask().getType() != EvaluationType.EXAMEN)
                .mapToDouble(StudentMark::getObtainedValue)
                .sum();
    }

    private double sumMarksByType(Long studentId, Long taId, EvaluationType type, int semester) {
        return markRepository.findByStudentIdAndEvaluationTaskTeacherAssignmentId(studentId, taId)
                .stream()
                .filter(m -> m.getEvaluationTask().getType() == type)
                .filter(m -> {
                    // Si un examen est enregistré, on vérifie à quel semestre il appartient
                    int p = m.getEvaluationTask().getPeriod();
                    if (semester == 1) return p == 1 || p == 2 || p == 0; // Convention 0 souvent utilisée pour Ex1
                    if (semester == 2) return p == 3 || p == 4;
                    return false;
                })
                .mapToDouble(StudentMark::getObtainedValue)
                .sum();
    }
}