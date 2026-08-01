package com.school.management.controller.academic.attendance;

import com.school.management.dto.academic.attendance.DailyAttendanceBatchDTO;
import com.school.management.dto.academic.attendance.DailyAttendanceStatusResponseDTO;
import com.school.management.dto.academic.attendance.MonthlyRegisterDTO;
import com.school.management.service.academic.attendance.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/record")
    public ResponseEntity<DailyAttendanceStatusResponseDTO> recordDailyAttendance(
            @Valid @RequestBody DailyAttendanceBatchDTO dto) {
        return ResponseEntity.ok(attendanceService.recordDailyAttendance(dto));
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyAttendanceStatusResponseDTO> getDailyAttendance(
            @RequestHeader("X-School-Id") Long schoolId,
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyAttendance(schoolId, classroomId, academicYearId, date));
    }

    @GetMapping("/monthly-register")
    public ResponseEntity<MonthlyRegisterDTO> getMonthlyRegister(
            @RequestHeader("X-School-Id") Long schoolId,
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlyRegister(schoolId, classroomId, academicYearId, year, month));
    }
}