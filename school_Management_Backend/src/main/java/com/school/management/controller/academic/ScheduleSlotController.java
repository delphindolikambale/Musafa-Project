package com.school.management.controller.academic;

import com.school.management.dto.academic.ScheduleSlotCreateDTO;
import com.school.management.dto.academic.ScheduleSlotResponseDTO;
import com.school.management.service.academic.ScheduleSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedulesSlot")
@RequiredArgsConstructor
public class ScheduleSlotController {

    private final ScheduleSlotService scheduleService;

    @PostMapping
    public ResponseEntity<ScheduleSlotResponseDTO> createSlot(@Valid @RequestBody ScheduleSlotCreateDTO dto) {
        return new ResponseEntity<>(scheduleService.addSlot(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}") // ✅ AJOUT
    public ResponseEntity<ScheduleSlotResponseDTO> updateSlot(
            @RequestHeader("X-School-Id") Long schoolId,
            @PathVariable Long id,
            @Valid @RequestBody ScheduleSlotCreateDTO dto) {
        return ResponseEntity.ok(scheduleService.updateSlot(schoolId, id, dto));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<List<ScheduleSlotResponseDTO>> getClassroomSchedule(
            @RequestHeader("X-School-Id") Long schoolId,
            @PathVariable Long classroomId,
            @RequestParam Long academicYearId) {
        return ResponseEntity.ok(scheduleService.getClassroomSchedule(schoolId, classroomId, academicYearId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ScheduleSlotResponseDTO>> getTeacherSchedule(
            @RequestHeader("X-School-Id") Long schoolId,
            @PathVariable Long teacherId,
            @RequestParam Long academicYearId) {
        return ResponseEntity.ok(scheduleService.getTeacherSchedule(schoolId, teacherId, academicYearId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@RequestHeader("X-School-Id") Long schoolId, @PathVariable Long id) {
        scheduleService.deleteSlot(schoolId, id);
        return ResponseEntity.noContent().build();
    }
}