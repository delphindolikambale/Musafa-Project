package com.school.management.dto.financial;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder

public class StudentFinancialAccountListDTO {
    private Long id;

    /**
     * Numéro de compte (souvent basé sur le matricule)
     */
    private String accountNumber;

    /**
     * Nom complet de l'élève
     */
    private String studentFullName;

    /**
     * Ajout du Genre pour l'affichage dans le tableau
     */
    private String gender;

    /**
     * Date d'ouverture du compte (Date d'inscription)
     */
    private LocalDate openedAt;

    /**
     * Statut du compte
     */
    private String status;
}
