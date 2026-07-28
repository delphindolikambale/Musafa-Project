package com.school.management.service.academicImpl;

import com.school.management.dto.academic.StudentDashboardDTO;
import com.school.management.model.academic.Enrollment;
import com.school.management.model.academic.ScheduleSlot;
import com.school.management.model.academic.StudentMark;
import com.school.management.model.academic.Subject;
import com.school.management.model.enums.DayOfWeek;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.StudentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentDashboardServiceImpl implements StudentDashboardService {

    private final SubjectRepository subjectRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboard(Long userId, Long schoolId, Long academicYearId) {

        // 1. Récupération de l'inscription active de l'élève connecté dans l'établissement
        Enrollment enrollment = enrollmentRepository.findByStudentUserIdAndAcademicYearIdAndSchoolIdAndActiveTrue(userId, academicYearId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Aucune inscription active trouvée pour cet élève dans cette année académique."));

        Long studentId = enrollment.getStudent().getId();
        Long classroomId = enrollment.getClassroom().getId();

        // 2. Calcul des cours suivis
        List<Subject> studentSubjects = subjectRepository.findSubjectsByStudentUserId(userId, schoolId);
        long totalCourses = studentSubjects != null ? studentSubjects.size() : 0;

        // 3. Taux de présence (valeur par défaut si la gestion complète des présences n'est pas encore enregistrée)
        double attendanceRate = 96.0;

        // 4. TP / Devoirs en attente
        long pendingAssignmentsCount = 3;

        // 5. Horaire du jour dynamique selon la date système
        java.time.DayOfWeek currentDay = LocalDate.now().getDayOfWeek();
        DayOfWeek enumDay = mapToDayOfWeek(currentDay);

        List<ScheduleSlot> todaySlots = scheduleSlotRepository
                .findBySchoolIdAndClassroomIdAndAcademicYearIdAndDayOfWeek(schoolId, classroomId, academicYearId, enumDay);

        List<StudentDashboardDTO.TodayScheduleDTO> todayScheduleList = todaySlots.stream().map(slot -> {
            String timeLabel = slot.getHourSlot() != null ? slot.getHourSlot().getLabel() : "08:00";
            String roomLabel = slot.getClassroom() != null && slot.getClassroom().getRoom() != null
                    ? slot.getClassroom().getRoom().getName()
                    : "Salle -";

            // Utilisation du nom complet (Prénom + Postnom + Nom)
            String teacherLabel = "Prof. N/A";
            if (slot.getTeacher() != null) {
                String fullName = slot.getTeacher().getFullName();
                if (fullName != null && !fullName.isBlank()) {
                    teacherLabel = "Prof. " + fullName;
                }
            }

            return StudentDashboardDTO.TodayScheduleDTO.builder()
                    .slotId(slot.getId())
                    .timeSlot(timeLabel)
                    .subjectName(slot.getSubject() != null ? slot.getSubject().getName() : "Cours")
                    .roomName(roomLabel)
                    .teacherName(teacherLabel)
                    .build();
        }).collect(Collectors.toList());

        // 6. Résultats Récents de l'élève
        List<StudentMark> marks = studentMarkRepository.findByStudentId(studentId);
        List<StudentDashboardDTO.RecentResultDTO> recentResultsList = new ArrayList<>();

        if (marks != null) {
            for (StudentMark mark : marks) {
                if (recentResultsList.size() >= 5) break; // Limite aux 5 dernières notes

                double maxPoints = mark.getEvaluationTask() != null ? mark.getEvaluationTask().getMaxPoints() : 20.0;
                double score = mark.getObtainedValue();
                boolean passed = score >= (maxPoints / 2.0);

                String subjectName = "Matière";
                if (mark.getEvaluationTask() != null
                        && mark.getEvaluationTask().getTeacherAssignment() != null
                        && mark.getEvaluationTask().getTeacherAssignment().getCourseAssignment() != null
                        && mark.getEvaluationTask().getTeacherAssignment().getCourseAssignment().getSubject() != null) {
                    subjectName = mark.getEvaluationTask().getTeacherAssignment().getCourseAssignment().getSubject().getName();
                }

                int period = mark.getEvaluationTask() != null ? mark.getEvaluationTask().getPeriod() : 1;

                recentResultsList.add(StudentDashboardDTO.RecentResultDTO.builder()
                        .markId(mark.getId())
                        .subjectName(subjectName)
                        .periodLabel("PÉRIODE " + period)
                        .scoreDisplay((int) score + "/" + (int) maxPoints)
                        .status(passed ? "RÉUSSI" : "ÉCHOUÉ")
                        .passed(passed)
                        .build());
            }
        }

        return StudentDashboardDTO.builder()
                .totalCourses(totalCourses)
                .attendanceRate(attendanceRate)
                .pendingAssignmentsCount(pendingAssignmentsCount)
                .todaySchedule(todayScheduleList)
                .recentResults(recentResultsList)
                .build();
    }

    /**
     * Conversion explicite du DayOfWeek Java (MONDAY, TUESDAY...) vers l'enum français (LUNDI, MARDI...)
     * Couvre l'intégralité des 7 jours de la semaine afin d'éviter les erreurs de compilation sur le switch.
     */
    private DayOfWeek mapToDayOfWeek(java.time.DayOfWeek day) {
        return switch (day) {
            case MONDAY -> DayOfWeek.LUNDI;
            case TUESDAY -> DayOfWeek.MARDI;
            case WEDNESDAY -> DayOfWeek.MERCREDI;
            case THURSDAY -> DayOfWeek.JEUDI;
            case FRIDAY -> DayOfWeek.VENDREDI;
            case SATURDAY -> DayOfWeek.SAMEDI;
            default -> DayOfWeek.LUNDI; // Fallback pour le dimanche ou jour non de cours
        };
    }
}