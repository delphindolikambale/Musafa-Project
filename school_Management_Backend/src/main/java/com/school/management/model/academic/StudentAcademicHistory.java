package com.school.management.model.academic;

import com.school.management.model.enums.AcademicStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "student_academic_histories",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_id", "academic_year_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentAcademicHistory {
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AcademicStatus academicStatus;

    @Column(length = 500)
    private String observation;

}
