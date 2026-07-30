package com.school.management.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private Long teacherId;

    // Informations de licence renvoyées au Frontend pour les Route Guards
    private Long schoolId;
    private String schoolCode;
    private boolean isSubscriptionActive;
    private boolean isSchoolConfigured;

    // ✅ AJOUT : L'identifiant de l'année académique active
    private Long academicYearId;
}