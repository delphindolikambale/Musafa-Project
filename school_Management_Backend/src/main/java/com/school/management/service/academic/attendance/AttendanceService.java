package com.school.management.service.academic.attendance;



import com.school.management.dto.academic.attendance.DailyAttendanceBatchDTO;
import com.school.management.dto.academic.attendance.DailyAttendanceStatusResponseDTO;
import com.school.management.dto.academic.attendance.MonthlyRegisterDTO;

import java.time.LocalDate;

public interface AttendanceService {
    DailyAttendanceStatusResponseDTO recordDailyAttendance(DailyAttendanceBatchDTO dto);

    DailyAttendanceStatusResponseDTO getDailyAttendance(Long schoolId, Long classroomId, Long academicYearId, LocalDate date);

    MonthlyRegisterDTO getMonthlyRegister(Long schoolId, Long classroomId, Long academicYearId, int year, int month);
}