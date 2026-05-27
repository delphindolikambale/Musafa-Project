package com.school.management.service.admin;

import com.school.management.dto.admin.SchoolConfigDTO;
import com.school.management.model.admin.SchoolConfiguration;

public interface SchoolConfigService {

    SchoolConfigDTO getConfig();

    SchoolConfigDTO saveOrUpdateConfig(SchoolConfigDTO dto);

    void deleteConfig();
}
