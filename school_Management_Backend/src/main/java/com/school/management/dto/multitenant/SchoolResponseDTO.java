package com.school.management.dto.multitenant;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class SchoolResponseDTO {
    private Long id;
    private String name;
    private String code;
    private String province;
    private String city;
    private boolean isActive;
    private LocalDate subscriptionEndDate;
    private String currentSubscriptionStatus;

    // ✅ AJOUTS : Visibilité pour le Super Admin (permet de lui donner le code en direct si besoin)
    private String contactEmail;
    private String activationCode;
}