package com.school.management.controller.admin;

import com.school.management.dto.admin.SchoolConfigDTO;
import com.school.management.service.admin.SchoolConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/school-config")
@RequiredArgsConstructor

public class SchoolConfigController {
    private final SchoolConfigService configService;

    @GetMapping
    public ResponseEntity<SchoolConfigDTO> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }

    // Utilisé pour la création initiale
    @PostMapping
    public ResponseEntity<SchoolConfigDTO> createConfig(@RequestBody SchoolConfigDTO dto) {
        return ResponseEntity.ok(configService.saveOrUpdateConfig(dto));
    }

    // Utilisé pour la modification (Update)
    @PutMapping
    public ResponseEntity<SchoolConfigDTO> updateConfig(@RequestBody SchoolConfigDTO dto) {
        return ResponseEntity.ok(configService.saveOrUpdateConfig(dto));
    }

    // Utilisé pour supprimer/réinitialiser la configuration
    @DeleteMapping
    public ResponseEntity<Void> deleteConfig() {
        configService.deleteConfig();
        return ResponseEntity.noContent().build();
    }
}
