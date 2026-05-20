package com.school.management.model.academic;

import com.school.management.model.enums.EvaluationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "evaluation_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class EvaluationTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationType type;

    @Column(nullable = false)
    private double maxPoints; // Le maxima défini par le prof pour cette interro

    @Column(nullable = false)
    private int period; // 1, 2, 3 ou 4

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_assignment_id")
    private TeacherAssignment teacherAssignment;

    private LocalDate evaluationDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;
}
