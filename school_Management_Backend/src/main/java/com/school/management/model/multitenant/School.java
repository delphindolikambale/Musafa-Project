package com.school.management.model.multitenant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ AJOUT : Importation pour ignorer les métadonnées de proxy Hibernate
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// ✅ AJOUT : Empêche Jackson de planter en ignorant les propriétés techniques injectées par les Proxies Hibernate Lazy
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    private String province;
    private String city;

    @Column(nullable = false)
    private boolean isActive = true;

    // ✅ AJOUTS SAAS : Suivi de la validité de la licence et de la configuration initiale
    @Column(name = "is_subscription_active", nullable = false)
    private boolean isSubscriptionActive = false;

    @Column(name = "is_school_configured", nullable = false)
    private boolean isSchoolConfigured = false;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "activation_code")
    private String activationCode;
}