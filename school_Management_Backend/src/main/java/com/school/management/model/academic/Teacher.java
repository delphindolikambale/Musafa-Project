package com.school.management.model.academic;

import com.school.management.model.auth.User;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(
        name = "teachers",
        uniqueConstraints = {
                // ✅ SÉCURITÉ MULTI-TENANT : Le matricule doit être unique AU SEIN de la même école seulement
                @UniqueConstraint(columnNames = {"school_id", "schoolRegistrationNumber"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String schoolRegistrationNumber;

    @Column(unique = true)
    private String nationalRegistrationNumber;

    private String lastName;
    private String middleName;
    private String firstName;
    private String gender;
    private String maritalStatus;
    private String placeOfBirth;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String email;
    private String residentialAddress;

    @Column(nullable = false)
    private boolean active = true;

    /**
     * ✅ NOUVEAU : Rattachement direct de l'enseignant à une école (Multi-tenant)
     * Indispensable pour l'affectation administrative hors compte applicatif actif.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "domain_speciality_id")
    private DomainSpeciality domainSpeciality;

    @ElementCollection
    @CollectionTable(name = "teacher_titles", joinColumns = @JoinColumn(name = "teacher_id"))
    private List<AcademicTitle> academicTitles;

    @ElementCollection
    @CollectionTable(name = "teacher_trainings", joinColumns = @JoinColumn(name = "teacher_id"))
    private List<Training> trainings;

    private String profilePicturePath;
    private String cvPath;
    private String directoryPath;

    // --- SOLUTION : Méthode personnalisée pour le nom complet ---
    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) sb.append(firstName).append(" ");
        if (middleName != null && !middleName.isEmpty()) sb.append(middleName).append(" ");
        if (lastName != null && !lastName.isEmpty()) sb.append(lastName);
        return sb.toString().trim();
    }
}