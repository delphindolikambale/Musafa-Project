package com.school.management.controller.academic;

import com.school.management.dto.academic.BulletinDataResponseDTO;
import com.school.management.service.academic.BulletinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bulletins")
@RequiredArgsConstructor
public class BulletinController {

    private final BulletinService bulletinService;

    @GetMapping("/student/{studentId}/year/{yearId}")
    public ResponseEntity<BulletinDataResponseDTO> getBulletin(
            @PathVariable Long studentId,
            @PathVariable Long yearId) {
        return ResponseEntity.ok(bulletinService.generateBulletin(studentId, yearId));
    }
}