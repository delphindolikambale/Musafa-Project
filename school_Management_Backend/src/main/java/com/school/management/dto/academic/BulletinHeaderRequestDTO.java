package com.school.management.dto.academic;

import lombok.Data;

@Data
public class BulletinHeaderRequestDTO {
    private String country;
    private String ministry;
    private String educationalProvince;
    private String city;
    private String communeTerritory;
    private String schoolName;
    private String schoolCode;
}