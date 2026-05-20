package com.school.management.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter @AllArgsConstructor

public class JwtResponse {

    private String token;
    private Long id; // ID du compte utilisateur
    private String username;
    private String email;
    private List<String> roles;

    // NOUVEAU : ID de l'enseignant pour filtrer le dashboard côté React
    private Long teacherId;
}
