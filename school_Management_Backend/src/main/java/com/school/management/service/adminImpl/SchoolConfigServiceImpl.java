package com.school.management.service.adminImpl;

import com.school.management.dto.admin.SchoolConfigDTO;
import com.school.management.model.admin.SchoolConfiguration;
import com.school.management.repository.admin.SchoolConfigurationRepository;
import com.school.management.service.admin.SchoolConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor

public class SchoolConfigServiceImpl implements SchoolConfigService {

    private final SchoolConfigurationRepository repository;

    @Override
    @Transactional(readOnly = true)
    public SchoolConfigDTO getConfig() {
        // Retourne la config existante ou un objet vide si rien n'existe
        SchoolConfiguration config = repository.findFirstByOrderByIdAsc()
                .orElse(new SchoolConfiguration());
        return mapToDTO(config);
    }

    @Override
    @Transactional
    public SchoolConfigDTO saveOrUpdateConfig(SchoolConfigDTO dto) {
        // On récupère l'unique enregistrement s'il existe
        SchoolConfiguration config = repository.findFirstByOrderByIdAsc()
                .orElse(new SchoolConfiguration());

        // Mise à jour des champs (Modification)
        config.setSchoolName(dto.getSchoolName());
        config.setSlogan(dto.getSlogan());
        config.setLogoBase64(dto.getLogoBase64());
        config.setAddress(dto.getAddress());
        config.setPhone(dto.getPhone());
        config.setEmail(dto.getEmail());
        config.setWebsite(dto.getWebsite());
        config.setProvince(dto.getProvince());
        config.setCity(dto.getCity());
        config.setSubdivision(dto.getSubdivision());
        config.setDecreeOfCreation(dto.getDecreeOfCreation());
        config.setHeadmasterName(dto.getHeadmasterName());
        config.setAcademicProviseur(dto.getAcademicProviseur());
        config.setDefaultCashierName(dto.getDefaultCashierName());

        // Save gère automatiquement l'ID (Update si ID présent, Insert sinon)
        return mapToDTO(repository.save(config));
    }

    @Override
    @Transactional
    public void deleteConfig() {
        // Supprime l'unique configuration pour permettre une réinitialisation
        repository.findFirstByOrderByIdAsc().ifPresent(repository::delete);
    }

    private SchoolConfigDTO mapToDTO(SchoolConfiguration entity) {
        return SchoolConfigDTO.builder()
                .id(entity.getId())
                .schoolName(entity.getSchoolName())
                .slogan(entity.getSlogan())
                .logoBase64(entity.getLogoBase64())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .province(entity.getProvince())
                .city(entity.getCity())
                .subdivision(entity.getSubdivision())
                .decreeOfCreation(entity.getDecreeOfCreation())
                .headmasterName(entity.getHeadmasterName())
                .academicProviseur(entity.getAcademicProviseur())
                .defaultCashierName(entity.getDefaultCashierName())
                .build();
    }
}
