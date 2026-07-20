package com.school.management.model.academic;

import com.school.management.model.multitenant.School;
import jakarta.persistence.*; // Utilisez javax.persistence.* si vous êtes sur une ancienne version de Spring Boot (avant la v3)
import lombok.*;

// Note: Assurez-vous que les imports ci-dessous correspondent bien à l'emplacement de vos entités dans votre projet.
// S'ils sont dans un autre package (ex: model.core), ajustez-les.
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.AcademicYear;
// import com.school.management.model.core.School;
// import com.school.management.model.users.Student;

@Entity
@Table(name = "bulletins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bulletin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relation avec l'élève
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // Relation avec la classe
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    // Relation avec l'année académique
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    // Relation Multi-Tenant obligatoire avec l'école
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    // Champ optionnel pour suivre l'état du bulletin (ex: INITIALIZED, PUBLISHED)
    @Column(name = "status")
    @Builder.Default
    private String status = "INITIALIZED";
}