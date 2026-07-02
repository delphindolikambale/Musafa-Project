package com.school.management.model.academic;

import com.school.management.model.multitenant.School; // ✅ AJOUT
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

    // ✅ MULTI-TENANT : Alignement sécurisé de la note à l'établissement d'inscription
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}