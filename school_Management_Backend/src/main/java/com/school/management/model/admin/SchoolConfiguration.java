package com.school.management.model.admin;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "school_configuration")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class SchoolConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- IDENTITÉ OFFICIELLE ---
    @Column(nullable = false)
    private String schoolName;
    private String slogan;

    @Column(columnDefinition = "LONGTEXT")
    private String logoBase64;

    private String address;
    private String phone;
    private String email;
    private String website;

    // --- ADMINISTRATIVE (Pour les rapports du Préfet/Proviseur) ---
    private String province;      // Ex: Nord-Kivu
    private String city;          // Ex: Goma
    private String subdivision;   // Ex: Goma Ouest
    private String decreeOfCreation; // Agrément / Arrêté ministériel

    // --- SIGNATAIRES ACTIFS ---
    private String headmasterName;    // Préfet des Études
    private String academicProviseur; // Proviseur
    private String defaultCashierName; // Caissier principal
}
