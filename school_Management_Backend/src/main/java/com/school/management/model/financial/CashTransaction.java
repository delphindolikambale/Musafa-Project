package com.school.management.model.financial;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class CashTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private String description;

    private LocalDate transactionDate;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal totalEntryUSD = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal totalExitUSD = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal balanceUSD = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal totalEntryCDF = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal totalExitCDF = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal balanceCDF = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_group_id")
    private FeesGroup feesGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_item_id")
    private FeesItem feesItem;
}
