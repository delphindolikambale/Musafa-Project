package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BulletinHeaderResponseDTO {
    private Long id;
    private String country;
    private String ministry;
    private String educationalProvince;
    private String city;
    private String communeTerritory;
    private String schoolName;
    private String schoolCode;

    private String flagImagePath;
    private String ministryLogoPath;
    private String watermarkLogoPath;
}