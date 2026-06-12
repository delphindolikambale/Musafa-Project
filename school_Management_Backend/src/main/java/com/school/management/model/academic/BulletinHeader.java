package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bulletin_headers")
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
}