package com.school.management.repository.academic.attendance;

import com.school.management.model.attendance.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    Optional<AttendanceSession> findBySchoolIdAndClassroomIdAndAcademicYearIdAndDate(
            Long schoolId, Long classroomId, Long academicYearId, LocalDate date);

    List<AttendanceSession> findBySchoolIdAndClassroomIdAndAcademicYearIdAndDateBetween(
            Long schoolId, Long classroomId, Long academicYearId, LocalDate startDate, LocalDate endDate);
}