package com.school.management.repository.academic.attendance;

import com.school.management.model.academic.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

    Optional<StudentAttendance> findBySchoolIdAndSessionIdAndStudentId(Long schoolId, Long sessionId, Long studentId);

    List<StudentAttendance> findBySchoolIdAndSessionId(Long schoolId, Long sessionId);

    @Query("SELECT sa FROM StudentAttendance sa " +
            "JOIN sa.session s " +
            "WHERE sa.school.id = :schoolId " +
            "AND s.classroom.id = :classroomId " +
            "AND s.academicYear.id = :academicYearId " +
            "AND sa.date BETWEEN :startDate AND :endDate")
    List<StudentAttendance> findMonthlyAttendances(
            @Param("schoolId") Long schoolId,
            @Param("classroomId") Long classroomId,
            @Param("academicYearId") Long academicYearId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT sa FROM StudentAttendance sa " +
            "JOIN sa.session s " +
            "WHERE sa.school.id = :schoolId " +
            "AND sa.student.id = :studentId " +
            "AND s.academicYear.id = :academicYearId " +
            "AND sa.date <= :endDate")
    List<StudentAttendance> findCumulatedAttendancesUpToDate(
            @Param("schoolId") Long schoolId,
            @Param("studentId") Long studentId,
            @Param("academicYearId") Long academicYearId,
            @Param("endDate") LocalDate endDate);
}