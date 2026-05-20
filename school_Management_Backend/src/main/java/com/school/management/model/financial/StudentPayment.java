package com.school.management.model.financial;

import com.school.management.model.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "annual_profile_id")
    private StudentAnnualFinancialProfile annualProfile;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @Column(nullable = false)
    private String paymentMethod;

    // Champ d'audit pour savoir qui a perçu l'argent
    private String collectedBy;

    @OneToMany(
            mappedBy = "studentPayment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<InstallmentSchedulePayment> installmentPayments = new ArrayList<>();

    @OneToMany(
            mappedBy = "payment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<StudentPaymentBreakdown> breakdowns = new ArrayList<>();
}
