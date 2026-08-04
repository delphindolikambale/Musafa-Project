package com.school.management.model.academic;

import com.school.management.model.enums.EnrollmentType;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Inscription annuelle d’un élève
 */
@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "academic_year_id", "school_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(optional = false)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    // COUPLAGE MULTI-TENANT : Chaque inscription est strictement liée à son école
    @ManyToOne(optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentType enrollmentType;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudentDocument> documents = new ArrayList<>();

    // ✅ CORRECTION : Ajout de @Builder.Default pour conserver active = true
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "enrollment_number", unique = true)
    private String enrollmentNumber;

    @PrePersist
    protected void onCreate() {
        if (this.enrollmentDate == null) {
            this.enrollmentDate = LocalDate.now();
        }
    }

    // Helper method pour ajouter un document
    public void addDocument(StudentDocument doc) {
        documents.add(doc);
        doc.setEnrollment(this);

        // ✅ CORRECTION MULTI-TENANT : Propagation automatique du contexte de l'école au document
        if (this.school != null) {
            doc.setSchool(this.school);
        }
    }
}