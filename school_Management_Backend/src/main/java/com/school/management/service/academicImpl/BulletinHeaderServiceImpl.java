package com.school.management.service.academicImpl;

import com.school.management.dto.academic.BulletinHeaderRequestDTO;
import com.school.management.dto.academic.BulletinHeaderResponseDTO;
import com.school.management.model.academic.BulletinHeader;
import com.school.management.repository.academic.BulletinHeaderRepository;
import com.school.management.service.academic.BulletinHeaderService;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.academic.storage.FileStorageService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class BulletinHeaderServiceImpl implements BulletinHeaderService {

    private final BulletinHeaderRepository repository;
    private final FileStorageService fileStorageService;

    /**
     * ✅ EXTRACTION DU CONTEXTE MULTI-TENANT SÉCURISÉ
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional(readOnly = true)
    public BulletinHeaderResponseDTO getBulletinHeader() {
        // ✅ MULTI-TENANT : Recherche cloisonnée par ID d'établissement
        return repository.findBySchoolId(getCurrentSchoolId())
                .map(this::mapToResponseDTO)
                .orElse(null); // Retourne null si l'admin n'a pas encore configuré l'en-tête de cette école
    }

    @Override
    public BulletinHeaderResponseDTO saveOrUpdateBulletinHeader(
            BulletinHeaderRequestDTO requestDTO,
            MultipartFile flagImage,
            MultipartFile ministryLogo,
            MultipartFile watermarkLogo) {

        // ✅ MULTI-TENANT : Recherche de la configuration existante de l'école ou création dédiée
        BulletinHeader header = repository.findBySchoolId(getCurrentSchoolId()).orElse(new BulletinHeader());

        header.setCountry(requestDTO.getCountry());
        header.setMinistry(requestDTO.getMinistry());
        header.setEducationalProvince(requestDTO.getEducationalProvince());
        header.setCity(requestDTO.getCity());
        header.setCommuneTerritory(requestDTO.getCommuneTerritory());
        header.setSchoolName(requestDTO.getSchoolName());
        header.setSchoolCode(requestDTO.getSchoolCode());
        header.setSchool(getCurrentUser().getSchool()); // ✅ MULTI-TENANT : Liaison obligatoire avec l'école courante

        // Gestion de l'upload des images via le service de stockage abstrait
        if (flagImage != null && !flagImage.isEmpty()) {
            header.setFlagImagePath(fileStorageService.storeFile(flagImage, "bulletin-headers", "flag_" + getCurrentSchoolId() + "_"));
        }
        if (ministryLogo != null && !ministryLogo.isEmpty()) {
            header.setMinistryLogoPath(fileStorageService.storeFile(ministryLogo, "bulletin-headers", "ministry_" + getCurrentSchoolId() + "_"));
        }
        if (watermarkLogo != null && !watermarkLogo.isEmpty()) {
            header.setWatermarkLogoPath(fileStorageService.storeFile(watermarkLogo, "bulletin-headers", "watermark_" + getCurrentSchoolId() + "_"));
        }

        BulletinHeader savedHeader = repository.save(header);
        return mapToResponseDTO(savedHeader);
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