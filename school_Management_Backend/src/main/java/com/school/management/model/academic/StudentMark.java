package com.school.management.model.academic;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_marks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class StudentMark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evaluation_task_id")
    private EvaluationTask evaluationTask;

    @Column(nullable = false)
    private double obtainedValue; // La note de l'élève
}
