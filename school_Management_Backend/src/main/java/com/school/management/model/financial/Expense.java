package com.school.management.model.financial;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String voucherNumber; // Numéro du Bon de Sortie (ex: BS-2026-04-001)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Currency currency;

    @Column(nullable = false)
    private String requestedBy;

    @Column(nullable = false)
    private String authorizedBy;

    @Column(nullable = false)
    private LocalDateTime expenseDate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_item_id", nullable = false)
    private FeesItem feesItem;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

}
