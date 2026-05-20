package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_assignment_id")
    private CourseAssignment courseAssignment; // Lien vers le cours et ses maximas

    @ManyToOne(optional = false)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom; // Lien vers la classe précise (ex: 4ème A)

    @Column(nullable = false)
    private double weeklyHours; // Charge horaire hebdomadaire

    @Column(nullable = false)
    private boolean isClassMaster = false; // Titulaire de la classe

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;
}
