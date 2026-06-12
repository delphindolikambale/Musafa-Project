package com.school.management.service.academicImpl;

import com.school.management.dto.academic.BulletinHeaderRequestDTO;
import com.school.management.dto.academic.BulletinHeaderResponseDTO;
import com.school.management.model.academic.BulletinHeader;
import com.school.management.repository.academic.BulletinHeaderRepository;
import com.school.management.service.academic.BulletinHeaderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BulletinHeaderServiceImpl implements BulletinHeaderService {

    private final BulletinHeaderRepository repository;

    // 🔥 CORRECTION : Utilisation du dossier "storage" pour harmoniser avec votre WebConfig
    private final String UPLOAD_DIR = "storage/bulletin-headers/";

    @Override
    @Transactional(readOnly = true)
    public BulletinHeaderResponseDTO getBulletinHeader() {
        return repository.findFirstByOrderByIdAsc()
                .map(this::mapToResponseDTO)
                .orElse(null); // Retourne null si l'admin n'a pas encore configuré l'en-tête
    }

    @Override
    public BulletinHeaderResponseDTO saveOrUpdateBulletinHeader(
            BulletinHeaderRequestDTO requestDTO,
            MultipartFile flagImage,
            MultipartFile ministryLogo,
            MultipartFile watermarkLogo) {

        // On cherche s'il existe déjà une configuration pour la mettre à jour, sinon on en crée une nouvelle
        BulletinHeader header = repository.findFirstByOrderByIdAsc().orElse(new BulletinHeader());

        header.setCountry(requestDTO.getCountry());
        header.setMinistry(requestDTO.getMinistry());
        header.setEducationalProvince(requestDTO.getEducationalProvince());
        header.setCity(requestDTO.getCity());
        header.setCommuneTerritory(requestDTO.getCommuneTerritory());
        header.setSchoolName(requestDTO.getSchoolName());
        header.setSchoolCode(requestDTO.getSchoolCode());

        // Gestion de l'upload des images
        if (flagImage != null && !flagImage.isEmpty()) {
            header.setFlagImagePath(saveImage(flagImage, "flag_"));
        }
        if (ministryLogo != null && !ministryLogo.isEmpty()) {
            header.setMinistryLogoPath(saveImage(ministryLogo, "ministry_"));
        }
        if (watermarkLogo != null && !watermarkLogo.isEmpty()) {
            header.setWatermarkLogoPath(saveImage(watermarkLogo, "watermark_"));
        }

        BulletinHeader savedHeader = repository.save(header);
        return mapToResponseDTO(savedHeader);
    }

    // Méthode utilitaire robuste pour sauvegarder physiquement les images
    private String saveImage(MultipartFile file, String prefix) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Génération d'un nom unique pour éviter les conflits d'écrasement
            String fileName = prefix + UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // On retourne le chemin relatif qui sera utilisé par l'API pour servir l'image
            return UPLOAD_DIR + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde de l'image de l'en-tête : " + e.getMessage());
        }
    }

    private BulletinHeaderResponseDTO mapToResponseDTO(BulletinHeader entity) {
        return BulletinHeaderResponseDTO.builder()
                .id(entity.getId())
                .country(entity.getCountry())
                .ministry(entity.getMinistry())
                .educationalProvince(entity.getEducationalProvince())
                .city(entity.getCity())
                .communeTerritory(entity.getCommuneTerritory())
                .schoolName(entity.getSchoolName())
                .schoolCode(entity.getSchoolCode())
                .flagImagePath(entity.getFlagImagePath())
                .ministryLogoPath(entity.getMinistryLogoPath())
                .watermarkLogoPath(entity.getWatermarkLogoPath())
                .build();
    }
}