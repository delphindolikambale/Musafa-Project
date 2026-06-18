package com.school.management.controller.multitenant;

import com.school.management.service.multitenant.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/schools")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SchoolActivationController {

    private final SchoolService schoolService;

    @PostMapping("/activate")
    public ResponseEntity<?> activateSchool(@RequestBody Map<String, String> request) {
        String schoolCode = request.get("schoolCode");
        String activationCode = request.get("activationCode");

        if (schoolCode == null || activationCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le code de l'établissement et la clé secrète sont obligatoires."));
        }

        try {
            schoolService.activateSchool(schoolCode, activationCode);
            return ResponseEntity.ok(Map.of("message", "Votre établissement a été débloqué et réactivé avec succès !"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}