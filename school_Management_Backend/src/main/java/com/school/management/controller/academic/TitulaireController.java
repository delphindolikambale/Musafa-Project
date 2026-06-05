package com.school.management.controller.academic;

import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.dto.academic.TitulaireMonitoringResponseDTO;
import com.school.management.service.academic.TitulaireService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/titulaire")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TitulaireController {

    private final TitulaireService titulaireService;

    @GetMapping("/my-classrooms/teacher/{teacherId}")
    public ResponseEntity<List<ClassroomResponseDTO>> getMyClassrooms(
            @PathVariable Long teacherId,
            @RequestParam(required = false) Long academicYearId) {
        return ResponseEntity.ok(titulaireService.getMyClassrooms(teacherId, academicYearId));
    }

    @GetMapping("/monitoring/classroom/{classroomId}/period/{period}")
    public ResponseEntity<TitulaireMonitoringResponseDTO> getMonitoring(
            @PathVariable Long classroomId,
            @PathVariable int period,
            @RequestParam Long academicYearId) {
        return ResponseEntity.ok(titulaireService.getMonitoringForClassroomAndPeriod(classroomId, period, academicYearId));
    }
}