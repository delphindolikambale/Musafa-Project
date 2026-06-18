package com.school.management.dto.multitenant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SchoolCreateDTO {

    @NotBlank(message = "Le nom de l'école est obligatoire")
    private String name;

    @NotBlank(message = "Le code d'identification unique est obligatoire")
    private String code;

    @NotBlank(message = "La province éducationnelle est obligatoire")
    private String province;

    @NotBlank(message = "La ville ou le territoire est obligatoire")
    private String city;

    // ✅ AJOUT : Email officiel de l'admin de l'école pour l'envoi instantané du code secret
    @NotBlank(message = "L'adresse email de l'administrateur de l'école est obligatoire")
    @Email(message = "Veuillez fournir une adresse email valide")
    private String contactEmail;

    private int initialSubscriptionMonths = 12;
    private int maxStudentsAllowed = 1000;
}