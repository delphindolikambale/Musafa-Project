package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
                                "student_payment_id"
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

    /* =========================
       TRAÇABILITÉ AUTOMATIQUE
       ========================= */
    // Ajout du numéro de tranche pour un suivi direct (ex: 1, 2, 3...)
    @Column(nullable = false)
    private Integer installmentNumber;

    /* =========================
       TRANCHE OFFICIELLE
       ========================= */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "installment_schedule_id", nullable = false)
    @JsonBackReference
    private InstallmentSchedule installmentSchedule;

    /* =========================
       PAIEMENT GLOBAL (Le Reçu)
       ========================= */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_payment_id", nullable = false)
    @JsonBackReference
    private StudentPayment studentPayment;

    /* =========================
       MONTANT APPLIQUÉ
       ========================= */
    // Le montant exact affecté à CETTE tranche lors de CE paiement
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountApplied;

    /* =========================
       ÉTAT DE LA TRANCHE APPRÈS PAIEMENT
       ========================= */
    // true si la tranche est maintenant totalement payée (solde = 0)
    @Column(nullable = false)
    private boolean fullyPaid;

    /* =========================
       AUDIT
       ========================= */
    @Column(nullable = false)
    private LocalDateTime appliedAt;
}
