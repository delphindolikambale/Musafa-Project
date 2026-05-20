package com.school.management.model.academic;

import com.school.management.model.auth.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "teachers")
@Data // Génère automatiquement les Getters, Setters, toString, etc.
@NoArgsConstructor
@AllArgsConstructor

public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
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

    // NOVEAU : Relation physique de liaison de compte (Option B)
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
}
