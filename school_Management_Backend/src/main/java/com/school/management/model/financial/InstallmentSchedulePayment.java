package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.school.management.model.multitenant.School;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "installment_schedule_payment",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "installment_schedule_id",
                                "student_payment_id",
                                "school_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentSchedulePayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer installmentNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "installment_schedule_id", nullable = false)
    @JsonBackReference
    private InstallmentSchedule installmentSchedule;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_payment_id", nullable = false)
    @JsonBackReference
    private StudentPayment studentPayment;

    // ✅ COUPLAGE MULTI-TENANT : Isolation explicite de l'affectation du paiement par école
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountApplied;

    @Column(nullable = false)
    private boolean fullyPaid;

    @Column(nullable = false)
    private LocalDateTime appliedAt;
}