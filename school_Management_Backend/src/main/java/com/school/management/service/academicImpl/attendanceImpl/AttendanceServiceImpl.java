package com.school.management.service.academicImpl.attendanceImpl;

import com.school.management.dto.academic.attendance.*;
import com.school.management.exception.BadRequestException;
import com.school.management.model.academic.*;
import com.school.management.model.enums.AttendanceSessionType;
import com.school.management.model.enums.AttendanceStatus;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.*;
import com.school.management.repository.academic.attendance.AttendanceSessionRepository;
import com.school.management.repository.academic.attendance.StudentAttendanceRepository;
import com.school.management.repository.multitenant.SchoolRepository;
import com.school.management.service.academic.attendance.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final SchoolRepository schoolRepository;
    private final ClassroomRepository classroomRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public DailyAttendanceStatusResponseDTO recordDailyAttendance(DailyAttendanceBatchDTO dto) {
        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new BadRequestException("École introuvable."));
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new BadRequestException("Classe introuvable."));
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new BadRequestException("Enseignant introuvable."));
        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new BadRequestException("Année académique introuvable."));

        // Recherche ou création de la session du jour
        AttendanceSession session = sessionRepository
                .findBySchoolIdAndClassroomIdAndAcademicYearIdAndDate(
                        dto.getSchoolId(), dto.getClassroomId(), dto.getAcademicYearId(), dto.getDate())
                .orElseGet(() -> AttendanceSession.builder()
                        .school(school)
                        .classroom(classroom)
                        .academicYear(academicYear)
                        .teacher(teacher)
                        .date(dto.getDate())
                        .morningDone(false)
                        .eveningDone(false)
                        .build());

        LocalDateTime now = LocalDateTime.now();

        if (dto.getSessionType() == AttendanceSessionType.MORNING) {
            session.setMorningDone(true);
            session.setMorningRecordedAt(now);
        } else if (dto.getSessionType() == AttendanceSessionType.EVENING) {
            if (!session.isMorningDone()) {
                throw new BadRequestException("Impossible d'effectuer le 2ème passage si le 1er passage du matin n'a pas été réalisé !");
            }
            session.setEveningDone(true);
            session.setEveningRecordedAt(now);
        }

        session = sessionRepository.save(session);

        // Traitement de chaque élève
        for (AttendanceEntryDTO entry : dto.getEntries()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new BadRequestException("Élève introuvable ID: " + entry.getStudentId()));

            final AttendanceSession finalSession = session;
            StudentAttendance attendance = studentAttendanceRepository
                    .findBySchoolIdAndSessionIdAndStudentId(dto.getSchoolId(), session.getId(), student.getId())
                    .orElseGet(() -> StudentAttendance.builder()
                            .school(school)
                            .session(finalSession)
                            .student(student)
                            .date(dto.getDate())
                            .finalStatus(AttendanceStatus.ABSENT)
                            .build());

            if (dto.getSessionType() == AttendanceSessionType.MORNING) {
                attendance.setMorningStatus(entry.getStatus());
                // Initialisation temporaire
                attendance.setFinalStatus(entry.getStatus());
            } else if (dto.getSessionType() == AttendanceSessionType.EVENING) {
                attendance.setEveningStatus(entry.getStatus());

                // RÈGLE MÉTIER STRICTE : Validation de la présence
                // L'élève est Présent ("|") SEULEMENT s'il a été coché PRESENT le matin ET le soir.
                if (attendance.getMorningStatus() == AttendanceStatus.PRESENT && entry.getStatus() == AttendanceStatus.PRESENT) {
                    attendance.setFinalStatus(AttendanceStatus.PRESENT);
                } else if (attendance.getMorningStatus() == AttendanceStatus.LATE && entry.getStatus() == AttendanceStatus.PRESENT) {
                    attendance.setFinalStatus(AttendanceStatus.LATE);
                } else if (attendance.getMorningStatus() == AttendanceStatus.SICK) {
                    attendance.setFinalStatus(AttendanceStatus.SICK);
                } else if (attendance.getMorningStatus() == AttendanceStatus.EXCUSED) {
                    attendance.setFinalStatus(AttendanceStatus.EXCUSED);
                } else {
                    // Si non validé le soir ou marqué absent -> ABSENT (-)
                    attendance.setFinalStatus(AttendanceStatus.ABSENT);
                }
            }

            if (entry.getRemarks() != null) {
                attendance.setRemarks(entry.getRemarks());
            }

            studentAttendanceRepository.save(attendance);
        }

        return getDailyAttendance(dto.getSchoolId(), dto.getClassroomId(), dto.getAcademicYearId(), dto.getDate());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyAttendanceStatusResponseDTO getDailyAttendance(Long schoolId, Long classroomId, Long academicYearId, LocalDate date) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new BadRequestException("Classe introuvable."));

        Optional<AttendanceSession> sessionOpt = sessionRepository
                .findBySchoolIdAndClassroomIdAndAcademicYearIdAndDate(schoolId, classroomId, academicYearId, date);

        if (sessionOpt.isEmpty()) {
            return DailyAttendanceStatusResponseDTO.builder()
                    .sessionId(null)
                    .date(date)
                    .classroomId(classroomId)
                    .classroomName(classroom.getDisplayName())
                    .morningDone(false)
                    .eveningDone(false)
                    .students(Collections.emptyList())
                    .build();
        }

        AttendanceSession session = sessionOpt.get();
        List<StudentAttendance> attendances = studentAttendanceRepository.findBySchoolIdAndSessionId(schoolId, session.getId());

        List<StudentAttendanceResponseDTO> studentDTOs = attendances.stream().map(sa ->
                StudentAttendanceResponseDTO.builder()
                        .studentId(sa.getStudent().getId())
                        .matricule(sa.getStudent().getMatricule())
                        .fullName(sa.getStudent().getFullName())
                        .gender(sa.getStudent().getGender())
                        .morningStatus(sa.getMorningStatus())
                        .eveningStatus(sa.getEveningStatus())
                        .finalStatus(sa.getFinalStatus())
                        .finalSymbol(sa.getFinalStatus() != null ? sa.getFinalStatus().getSymbol() : "-")
                        .remarks(sa.getRemarks())
                        .build()
        ).collect(Collectors.toList());

        return DailyAttendanceStatusResponseDTO.builder()
                .sessionId(session.getId())
                .date(date)
                .classroomId(classroomId)
                .classroomName(classroom.getDisplayName())
                .morningDone(session.isMorningDone())
                .eveningDone(session.isEveningDone())
                .students(studentDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyRegisterDTO getMonthlyRegister(Long schoolId, Long classroomId, Long academicYearId, int year, int month) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new BadRequestException("Classe introuvable."));
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new BadRequestException("École introuvable."));
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new BadRequestException("Année académique introuvable."));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // Récupération de toutes les sessions enregistrées dans le mois
        List<AttendanceSession> monthSessions = sessionRepository
                .findBySchoolIdAndClassroomIdAndAcademicYearIdAndDateBetween(schoolId, classroomId, academicYearId, startDate, endDate);

        // Nombre de jours de classe effectifs dans le mois (N)
        int totalClassDays = (int) monthSessions.stream().filter(AttendanceSession::isEveningDone).count();

        // Récupération des données de présence
        List<StudentAttendance> monthAttendances = studentAttendanceRepository
                .findMonthlyAttendances(schoolId, classroomId, academicYearId, startDate, endDate);

        // Récupération de tous les élèves de la classe
        List<Student> students = studentRepository.findAll(); // Peut être filtré selon le schéma d'inscription

        Map<Integer, Integer> dailyTotalPresences = new HashMap<>();
        Map<Integer, Integer> dailyTotalAbsences = new HashMap<>();

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            dailyTotalPresences.put(day, 0);
            dailyTotalAbsences.put(day, 0);
        }

        List<StudentMonthlyRowDTO> studentRows = new ArrayList<>();

        for (Student student : students) {
            Map<Integer, String> dailySymbols = new HashMap<>();
            int monthlyPresences = 0;
            int monthlyAbsences = 0;

            List<StudentAttendance> studentRecords = monthAttendances.stream()
                    .filter(sa -> sa.getStudent().getId().equals(student.getId()))
                    .collect(Collectors.toList());

            for (StudentAttendance sa : studentRecords) {
                int dayOfMonth = sa.getDate().getDayOfMonth();
                AttendanceStatus status = sa.getFinalStatus();
                String symbol = status != null ? status.getSymbol() : "-";

                dailySymbols.put(dayOfMonth, symbol);

                if (status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE) {
                    monthlyPresences++;
                    dailyTotalPresences.put(dayOfMonth, dailyTotalPresences.get(dayOfMonth) + 1);
                } else {
                    monthlyAbsences++;
                    dailyTotalAbsences.put(dayOfMonth, dailyTotalAbsences.get(dayOfMonth) + 1);
                }
            }

            // Cumul général jusqu'à la fin du mois
            List<StudentAttendance> cumulatedRecords = studentAttendanceRepository
                    .findCumulatedAttendancesUpToDate(schoolId, student.getId(), academicYearId, endDate);

            int cumulatedPresences = (int) cumulatedRecords.stream()
                    .filter(sa -> sa.getFinalStatus() == AttendanceStatus.PRESENT || sa.getFinalStatus() == AttendanceStatus.LATE)
                    .count();

            // Calcul du pourcentage de fréquentation
            double attendancePercentage = totalClassDays > 0
                    ? Math.round(((double) monthlyPresences / totalClassDays) * 100.0 * 100.0) / 100.0
                    : 0.0;

            studentRows.add(StudentMonthlyRowDTO.builder()
                    .studentId(student.getId())
                    .matricule(student.getMatricule())
                    .fullName(student.getFullName())
                    .gender(student.getGender() != null ? student.getGender().name() : "")
                    .dailySymbols(dailySymbols)
                    .monthlyPresences(monthlyPresences)
                    .monthlyAbsences(monthlyAbsences)
                    .cumulatedPresences(cumulatedPresences)
                    .attendancePercentage(attendancePercentage)
                    .build());
        }

        String titulaireName = (classroom.getTitulaire() != null) ? classroom.getTitulaire().getFullName() : "Non assigné";

        return MonthlyRegisterDTO.builder()
                .schoolName(school.getName()) //  Correction apportée : school.getName() au lieu de school.getSchoolName()
                .classroomName(classroom.getDisplayName())
                .titulaireName(titulaireName)
                .academicYearName(academicYear.getName())
                .monthName(yearMonth.getMonth().name())
                .monthValue(month)
                .year(year)
                .totalClassDays(totalClassDays)
                .studentRows(studentRows)
                .dailyTotalPresences(dailyTotalPresences)
                .dailyTotalAbsences(dailyTotalAbsences)
                .build();
    }
}