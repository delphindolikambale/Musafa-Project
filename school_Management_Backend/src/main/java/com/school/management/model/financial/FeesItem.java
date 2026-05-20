package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.school.management.model.academic.AcademicYear;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "fees_item",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "academic_year_id",
                                "fees_group_id",
                                "name_fees_item"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class FeesItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "fees_group_id", nullable = false)
    @JsonBackReference
    private FeesGroup feesGroup;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(name = "name_fees_item", nullable = false, length = 100)
    private String nameFeesItem;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    /* --- NOUVEAUX CHAMPS : SOLDES RÉELS DE L'ITEM --- */
    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balanceUSD = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balanceCDF = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

}
