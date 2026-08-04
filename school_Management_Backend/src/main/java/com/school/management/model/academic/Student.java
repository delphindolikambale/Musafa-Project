package com.school.management.model.academic;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ UNIQUE AJOUT D'IMPORT
import com.school.management.model.enums.Gender;
import com.school.management.model.enums.StudentStatus;
import com.school.management.model.auth.User;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Cette classe représente l'IDENTITÉ PERMANENTE d'un élève au Complexe Scolaire MUSAFA.
 * Elle assure le suivi continu du parcours scolaire d'une année à l'autre.
 */
@Entity
@Table(
        name = "students",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "permanent_number"),
                @UniqueConstraint(columnNames = "matricule"),
                @UniqueConstraint(columnNames = "national_id") // ✅ ADAPTATION : Rendre le N° ID unique
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Matricule interne unique généré lors de la première inscription.
     * Format : [ID_INSCRIPTION][YY] (ex: 126).
     * Reste immuable durant tout le parcours à MUSAFA.
     */
    @Column(name = "matricule", unique = true)
    private String matricule;

    /**
     * Numéro Permanent National (RDC).
     */
    @Column(name = "permanent_number", nullable = false, unique = true, length = 50)
    private String permanentNumber;

    /**
     * ✅ ADAPTATION : Numéro d'Identification Nationale (N° ID. - 27 cases pour le Bulletin).
     */
    @Column(name = "national_id", unique = true, length = 50)
    private String nationalId;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "post_name", nullable = false)
    private String postName;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(name = "birth_place", nullable = false)
    private String birthPlace;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    /**
     * Statut administratif de l'élève (ACTIF, SUSPENDU, SORTI).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status = StudentStatus.ACTIF;

    /**
     * Localisation pour la gestion administrative.
     */
    @Column(nullable = false)
    private String commune;

    @Column(nullable = false)
    private String quartier;

    /**
     * Informations parentales pour le dossier académique.
     */
    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "father_profession")
    private String fatherProfession;

    @Column(name = "mother_name")
    private String motherName;

    @Column(name = "mother_profession")
    private String motherProfession;

    /**
     * Lien vers la photo pour la génération des bulletins et documents officiels.
     */
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    /**
     * ✅ NOUVEAU : Rattachement direct de l'élève à une école spécifique (Multi-tenant)
     * Permet à l'élève d'exister même sans compte utilisateur global actif.
     * * 🔧 ADAPTATION : L'annotation @JsonIgnoreProperties empêche Jackson de bloquer
     * sur les attributs proxy d'Hibernate lors du Lazy Loading.
     */
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /**
     * Lien vers le compte utilisateur global de l'application
     * @JsonIgnore empêche la sérialisation infinie et protège les données d'authentification
     */
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Nom complet formaté pour les rapports et l'interface Web/Mobile.
     */
    @Transient
    public String getFullName() {
        return String.format("%s %s %s", lastName, postName, firstName).toUpperCase();
    }
}