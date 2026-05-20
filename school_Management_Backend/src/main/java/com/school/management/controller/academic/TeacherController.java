package com.school.management.controller.academic;

import com.school.management.dto.academic.TeacherCreateDTO;
import com.school.management.dto.academic.TeacherResponseDTO;
import com.school.management.service.academic.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor

public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeacherResponseDTO> createTeacher(
            @RequestPart("teacher") TeacherCreateDTO createDTO,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "cv", required = false) MultipartFile cv,
            @RequestPart(value = "titleDocs", required = false) List<MultipartFile> titleDocs,
            @RequestPart(value = "trainingDocs", required = false) List<MultipartFile> trainingDocs) {
        return new ResponseEntity<>(teacherService.createTeacher(createDTO, photo, cv, titleDocs, trainingDocs), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TeacherResponseDTO>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    // Endpoint pour récupérer seulement les actifs (utile pour les selects d'affectation)
    @GetMapping("/active")
    public ResponseEntity<List<TeacherResponseDTO>> getActiveTeachers() {
        return ResponseEntity.ok(teacherService.getActiveTeachers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<TeacherResponseDTO>> search(@RequestParam("query") String query) {
        return ResponseEntity.ok(teacherService.searchTeachers(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacherById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeacherResponseDTO> updateTeacher(
            @PathVariable Long id,
            @RequestPart("teacher") TeacherCreateDTO updateDTO,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "cv", required = false) MultipartFile cv,
            @RequestPart(value = "titleDocs", required = false) List<MultipartFile> titleDocs,
            @RequestPart(value = "trainingDocs", required = false) List<MultipartFile> trainingDocs) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, updateDTO, photo, cv, titleDocs, trainingDocs));
    }

    // Nouveau : Bascule du statut actif/inactif
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<TeacherResponseDTO> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.toggleActiveStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
