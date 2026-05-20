package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.enums.FeesGroupType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "fees_group",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"academic_year_id", "type"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FeesGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FeesGroupType type; // SCOLARITE | DIVERS

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    /* --- NOUVEAUX CHAMPS : SOLDES RÉELS DU GROUPE --- */
    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balanceUSD = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balanceCDF = BigDecimal.ZERO;

    @OneToMany(
            mappedBy = "feesGroup",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    @Builder.Default
    private List<FeesItem> feesItems = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

}
