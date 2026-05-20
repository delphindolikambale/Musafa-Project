package com.school.management.model.financial;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Enrollment;
import com.school.management.model.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "student_annual_financial_profiles",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {
                        "financial_account_id",
                        "academic_year_id"
                })
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentAnnualFinancialProfile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "financial_account_id")
    private StudentFinancialAccount financialAccount;

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @OneToOne(optional = false)
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_fees_id", nullable = false)
    private ScheduleFees scheduleFees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmountDue;

    @Builder.Default
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmountPaid = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance;

    @Column(nullable = false, updatable = false)
    private LocalDate createdAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) this.createdAt = LocalDate.now();
        refreshFromSchedule(); // On utilise la nouvelle méthode
    }

    @PreUpdate
    public void onPreUpdate() {
        syncBalance();
    }

    /* =========================
       LOGIQUE DE SYNCHRONISATION
       ========================= */

    /**
     * Met à jour les montants du profil en fonction du barème actuel.
     * Utile lors de la création ET lors d'une modification du barème global.
     */
    public void refreshFromSchedule() {
        if (this.scheduleFees != null) {
            this.totalAmountDue = this.scheduleFees.getTotalAmount();
            this.currency = this.scheduleFees.getCurrency();
            syncBalance();
        }
    }

    public void syncBalance() {
        BigDecimal due = (this.totalAmountDue != null) ? this.totalAmountDue : BigDecimal.ZERO;
        BigDecimal paid = (this.totalAmountPaid != null) ? this.totalAmountPaid : BigDecimal.ZERO;
        this.balance = due.subtract(paid);
    }
}
