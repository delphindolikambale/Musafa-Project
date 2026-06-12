package com.school.management.controller.academic;

import com.school.management.dto.academic.BulletinHeaderRequestDTO;
import com.school.management.dto.academic.BulletinHeaderResponseDTO;
import com.school.management.service.academic.BulletinHeaderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bulletin-headers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BulletinHeaderController {

    private final BulletinHeaderService bulletinHeaderService;

    @GetMapping
    public ResponseEntity<BulletinHeaderResponseDTO> getHeader() {
        BulletinHeaderResponseDTO header = bulletinHeaderService.getBulletinHeader();
        if (header == null) {
            // Renvoie 204 No Content si la configuration n'existe pas encore
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(header);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulletinHeaderResponseDTO> saveOrUpdateHeader(
            @RequestPart("headerData") BulletinHeaderRequestDTO requestDTO,
            @RequestPart(value = "flagImage", required = false) MultipartFile flagImage,
            @RequestPart(value = "ministryLogo", required = false) MultipartFile ministryLogo,
            @RequestPart(value = "watermarkLogo", required = false) MultipartFile watermarkLogo) {

        BulletinHeaderResponseDTO savedHeader = bulletinHeaderService.saveOrUpdateBulletinHeader(
                requestDTO, flagImage, ministryLogo, watermarkLogo);

        return new ResponseEntity<>(savedHeader, HttpStatus.OK);
    }
}