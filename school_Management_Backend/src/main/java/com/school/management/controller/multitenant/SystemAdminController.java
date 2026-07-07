package com.school.management.controller.multitenant;

import com.school.management.dto.multitenant.SchoolCreateDTO;
import com.school.management.dto.multitenant.SchoolResponseDTO;
import com.school.management.model.multitenant.SystemSettings;
import com.school.management.service.multitenantImpl.SchoolServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system-admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SystemAdminController {

    private final SchoolServiceImpl schoolService;

    // ✅ Endpoint public pour charger la liste des écoles à l'inscription
    @GetMapping("/public/schools")
    public ResponseEntity<List<Map<String, Object>>> getPublicSchools() {
        List<Map<String, Object>> publicSchools = schoolService.getAllSchools().stream()
                .filter(SchoolResponseDTO::isActive) // On ne garde que les écoles actives
                .map(school -> Map.of(
                        "id", (Object) school.getId(),
                        "name", (Object) school.getName()
                ))
                .toList();
        return ResponseEntity.ok(publicSchools);
    }

    // ✅ NOUVEAU : Endpoint public pour charger le nom et le logo sur la page d'accueil sans authentification
    @GetMapping("/public/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        SystemSettings settings = schoolService.getSystemSettings();
        return ResponseEntity.ok(Map.of(
                "applicationName", settings.getApplicationName() != null ? settings.getApplicationName() : "MyAcademia",
                "globalLogoPath", settings.getGlobalLogoPath() != null ? settings.getGlobalLogoPath() : ""
        ));
    }

    @PostMapping("/schools")
    public ResponseEntity<SchoolResponseDTO> createSchool(@Valid @RequestBody SchoolCreateDTO dto) {
        return ResponseEntity.ok(schoolService.registerNewSchool(dto));
    }

    @PostMapping("/schools/{id}/pay-subscription")
    public ResponseEntity<SchoolResponseDTO> collectSubscriptionPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentPayload) {

        LocalDate endDate = LocalDate.parse(paymentPayload.get("endDate").toString());
        Double amount = Double.valueOf(paymentPayload.get("amount").toString());
        String currency = paymentPayload.get("currency").toString();

        return ResponseEntity.ok(schoolService.recordSubscriptionPayment(id, endDate, amount, currency));
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