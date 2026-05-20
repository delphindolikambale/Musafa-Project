package com.school.management.model.academic;

import com.school.management.model.enums.VisaStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "period_validations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"teacher_assignment_id", "period"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class PeriodValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_assignment_id")
    private TeacherAssignment teacherAssignment;

    @Column(nullable = false)
    private int period;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisaStatus status;

    private LocalDateTime submissionDate;
    private LocalDateTime validationDate;
}
