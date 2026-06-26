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

    @PostMapping("/schools")
    public ResponseEntity<SchoolResponseDTO> createSchool(@Valid @RequestBody SchoolCreateDTO dto) {
        return ResponseEntity.ok(schoolService.registerNewSchool(dto));
    }

    // ✅ NOUVEAU : Endpoint appelé lors de l'enregistrement du paiement Cash dans l'interface Abonnement
    @PostMapping("/schools/{id}/pay-subscription")
    public ResponseEntity<SchoolResponseDTO> collectSubscriptionPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentPayload) {

        LocalDate endDate = LocalDate.parse(paymentPayload.get("endDate").toString());
        Double amount = Double.valueOf(paymentPayload.get("amount").toString());
        String currency = paymentPayload.get("currency").toString(); // Ex: "USD" ou "CDF"

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