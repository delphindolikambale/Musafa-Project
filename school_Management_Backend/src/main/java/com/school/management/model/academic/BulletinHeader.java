package com.school.management.model.academic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "bulletin_headers",
        uniqueConstraints = {
                // MULTI-TENANT : Un seul en-tête de bulletin par établissement
                @UniqueConstraint(columnNames = {"school_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulletinHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String country;

    @Column(length = 150)
    private String ministry;

    @Column(length = 150)
    private String educationalProvince;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String communeTerritory;

    @Column(length = 150)
    private String schoolName;

    @Column(length = 50)
    private String schoolCode;

    // Chemins de stockage pour les images
    private String flagImagePath;
    private String ministryLogoPath;
    private String watermarkLogoPath;

    // ✅ CORRECTION : Ajout de @JsonIgnoreProperties pour éviter LazyInitializationException lors de la sérialisation
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}