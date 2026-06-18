package com.school.management.controller.multitenant;

import com.school.management.dto.multitenant.SchoolCreateDTO;
import com.school.management.dto.multitenant.SchoolResponseDTO;
import com.school.management.model.multitenant.SystemSettings;
import com.school.management.service.multitenant.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/system-admin")
@RequiredArgsConstructor
public class SystemAdminController {

    private final SchoolService schoolService;

    @PostMapping("/schools")
    public ResponseEntity<SchoolResponseDTO> createSchool(@Valid @RequestBody SchoolCreateDTO dto) {
        return ResponseEntity.ok(schoolService.registerNewSchool(dto));
    }

    @GetMapping("/schools")
    public ResponseEntity<List<SchoolResponseDTO>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @PutMapping("/schools/{id}/toggle")
    public ResponseEntity<SchoolResponseDTO> toggleAccess(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(schoolService.toggleSchoolAccess(id, active));
    }

    @PostMapping("/schools/{id}/renew")
    public ResponseEntity<SchoolResponseDTO> renewSchoolSubscription(@PathVariable Long id, @RequestParam int months) {
        return ResponseEntity.ok(schoolService.renewSubscription(id, months));
    }

    @GetMapping("/settings")
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(schoolService.getSystemSettings());
    }

    @PostMapping("/settings")
    public ResponseEntity<SystemSettings> updateSettings(
            @RequestParam("applicationName") String appName,
            @RequestParam(value = "logo", required = false) MultipartFile logo) {
        return ResponseEntity.ok(schoolService.updateSystemSettings(appName, logo));
    }
}