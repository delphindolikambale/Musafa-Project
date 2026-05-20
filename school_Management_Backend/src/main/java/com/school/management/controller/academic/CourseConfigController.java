package com.school.management.controller.academic;
import com.school.management.dto.academic.CourseAssignmentRequestDTO;
import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.ImportConfigRequestDTO;
import com.school.management.model.academic.CourseAssignment;
import com.school.management.service.academic.CourseConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/config/courses")
@RequiredArgsConstructor
public class CourseConfigController {

    private final CourseConfigService configService;

    @PostMapping("/assign")
    public ResponseEntity<CourseAssignment> assignCourse(@RequestBody CourseAssignmentRequestDTO dto) {
        CourseAssignment created = configService.configureCourse(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/import-previous-year")
    public ResponseEntity<Void> importPreviousYear(@RequestBody ImportConfigRequestDTO dto) {
        configService.importConfigurationFromPreviousYear(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseAssignment> updateConfig(@PathVariable Long id, @RequestBody CourseAssignmentRequestDTO dto) {
        return ResponseEntity.ok(configService.updateCourseConfig(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        configService.deleteCourseConfig(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<CourseAssignmentResponseDTO>> getConfig(
            @RequestParam Long levelId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long optionId,
            @RequestParam Long yearId) {

        List<CourseAssignmentResponseDTO> configurations = configService.getPedagogicalConfiguration(levelId, sectionId, optionId, yearId);
        return ResponseEntity.ok(configurations);
    }
}
