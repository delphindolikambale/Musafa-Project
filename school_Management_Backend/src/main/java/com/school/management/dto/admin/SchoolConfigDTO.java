package com.school.management.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor

public class SchoolConfigDTO {

    private Long id;
    private String schoolName;
    private String slogan;
    private String logoBase64;
    private String address;
    private String phone;
    private String email;
    private String website;
    private String province;
    private String city;
    private String subdivision;
    private String decreeOfCreation;
    private String headmasterName;
    private String academicProviseur;
    private String defaultCashierName;
}
