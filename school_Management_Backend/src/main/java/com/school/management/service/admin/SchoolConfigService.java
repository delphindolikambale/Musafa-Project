package com.school.management.service.admin;

import com.school.management.dto.admin.SchoolConfigDTO;
import com.school.management.model.admin.SchoolConfiguration;

public interface SchoolConfigService {

    SchoolConfigDTO getConfig();

    SchoolConfigDTO saveOrUpdateConfig(SchoolConfigDTO dto);

    // Nouvelle méthode pour réinitialiser ou supprimer la configuration
    void deleteConfig();
}
