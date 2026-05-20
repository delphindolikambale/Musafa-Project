package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Level;
import com.school.management.model.academic.Option;
import com.school.management.model.enums.Currency;
import com.school.management.model.enums.PaymentFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "schedule_fees",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"academic_year_id", "level_id", "option_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleFees {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(optional = false)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @ManyToOne
    @JoinColumn(name = "option_id")
    private Option option;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private Integer numberOfInstallments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentFrequency paymentFrequency;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "scheduleFees", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<InstallmentSchedule> installments = new ArrayList<>();

    /* =========================
       NOUVEAU : RELATION POUR LA SYNCHRO
       ========================= */
    @OneToMany(mappedBy = "scheduleFees")
    @Builder.Default
    private List<StudentAnnualFinancialProfile> linkedProfiles = new ArrayList<>();

}


