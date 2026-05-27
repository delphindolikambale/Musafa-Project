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
        SchoolConfigDTO dto = configService.getConfig();
        if (dto == null) {
            // Renvoie 204 No Content si aucune config n'existe (évite l'erreur 500)
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    // Le POST et le PUT feront exactement la même chose : un Upsert intelligent
    @PostMapping
    public ResponseEntity<SchoolConfigDTO> createConfig(@RequestBody SchoolConfigDTO dto) {
        return ResponseEntity.ok(configService.saveOrUpdateConfig(dto));
    }

    @PutMapping
    public ResponseEntity<SchoolConfigDTO> updateConfig(@RequestBody SchoolConfigDTO dto) {
        return ResponseEntity.ok(configService.saveOrUpdateConfig(dto));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteConfig() {
        configService.deleteConfig();
        return ResponseEntity.noContent().build();
    }
}
