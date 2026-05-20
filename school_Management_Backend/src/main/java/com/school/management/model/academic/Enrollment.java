package com.school.management.model.academic;

import com.school.management.model.enums.EnrollmentType;
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
                @UniqueConstraint(columnNames = {"student_id", "academic_year_id"})
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

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentType enrollmentType;

    // ✅ ADAPTATION : Liste d'objets documents au lieu d'une liste de Strings
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentDocument> documents = new ArrayList<>();

    @Column(nullable = false)
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
    }
}
