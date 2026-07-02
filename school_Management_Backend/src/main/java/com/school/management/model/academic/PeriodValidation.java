package com.school.management.model.academic;

import com.school.management.model.enums.VisaStatus;
import com.school.management.model.multitenant.School; // ✅ AJOUT
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "period_validations", uniqueConstraints = {
        // ✅ MULTI-TENANT : L'unicité est maintenant isolée par établissement
        @UniqueConstraint(columnNames = {"teacher_assignment_id", "period", "school_id"})
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

    @Column(name = "reject_comment", length = 500)
    private String rejectComment;

    // ✅ MULTI-TENANT : Isolation explicite du Visa de période
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;
}