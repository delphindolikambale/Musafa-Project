package com.school.management.controller.academic;

import com.school.management.model.academic.AcademicYear;
import com.school.management.service.academicImpl.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
@RequiredArgsConstructor // Simplifie l'injection du service


public class AcademicYearController {
    private final AcademicYearService academicYearService;

    @PostMapping
    public ResponseEntity<AcademicYear> createAcademicYear(@RequestBody AcademicYear academicYear) {
        AcademicYear saved = academicYearService.save(academicYear);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearService.findAll());
    }

    /**
     * Retourne l'année active ou 204 si aucune n'est activée.
     */
    @GetMapping("/active")
    public ResponseEntity<AcademicYear> getActiveYear() {
        AcademicYear active = academicYearService.getAnneeActive();
        if (active == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(active);
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateYear(@PathVariable Long id) {
        academicYearService.activerAnnee(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYear> updateAcademicYear(@PathVariable Long id, @RequestBody AcademicYear academicYear) {
        academicYear.setId(id);
        AcademicYear updated = academicYearService.save(academicYear);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteYear(@PathVariable Long id) {
        academicYearService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
