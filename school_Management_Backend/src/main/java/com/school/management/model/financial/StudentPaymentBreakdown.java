package com.school.management.model.financial;

import com.school.management.model.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "student_payment_breakdowns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentPaymentBreakdown {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private StudentPayment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_group_id")
    private FeesGroup feesGroup;

    @Column(name = "fees_group_name", nullable = false)
    private String feesGroupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_item_id")
    private FeesItem feesItem;

    @Column(name = "fees_item_name", nullable = false)
    private String feesItemName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Currency currency;

    @Column(name = "applied_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal appliedPercentage;
}