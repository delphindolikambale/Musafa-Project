package com.school.management.model.academic;
import com.school.management.model.enums.Gender;
import com.school.management.model.enums.StudentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Lob; // Optionnel selon ta version de Hibernate

/**
 * Cette classe représente l'IDENTITÉ PERMANENTE d'un élève au Complexe Scolaire MUSAFA[cite: 16].
 * Elle assure le suivi continu du parcours scolaire d'une année à l'autre[cite: 45, 51].
 */
@Entity
@Table(
        name = "students",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "permanent_number"),
                @UniqueConstraint(columnNames = "matricule")
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
     * Matricule interne unique généré lors de la première inscription[cite: 70].
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
     * Statut administratif de l'élève (ACTIF, SUSPENDU, SORTI)[cite: 93].
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status = StudentStatus.ACTIF;

    /**
     * Localisation pour la gestion administrative[cite: 34].
     */
    @Column(nullable = false)
    private String commune;

    @Column(nullable = false)
    private String quartier;

    /**
     * Informations parentales pour le dossier académique[cite: 94].
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
     * Lien vers la photo pour la génération des bulletins et documents officiels[cite: 43, 120].
     */
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    /**
     * Nom complet formaté pour les rapports et l'interface Web/Mobile[cite: 48, 156].
     */
    @Transient
    public String getFullName() {
        return String.format("%s %s %s", lastName, postName, firstName).toUpperCase();
    }

}
