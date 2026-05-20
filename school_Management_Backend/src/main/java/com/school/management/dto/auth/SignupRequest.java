package com.school.management.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class SignupRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 30, message = "Le nom d'utilisateur doit avoir entre 3 et 30 caractères")
    private String username;

    @NotBlank(message = "L'adresse email est obligatoire")
    @Size(max = 50)
    @Email(message = "Format de l'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, max = 40, message = "Le mot de passe doit avoir au moins 6 caractères")
    private String password;
}
