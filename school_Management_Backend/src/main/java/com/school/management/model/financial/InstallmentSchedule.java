package com.school.management.model.financial;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.school.management.model.academic.Level;
import com.school.management.model.academic.Option;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "installment_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

//cette classe gère la façon dont sont organiser les tranches
public class InstallmentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer installmentNumber;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Boolean paid = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_fees_id", nullable = false)
    @JsonBackReference
    private ScheduleFees scheduleFees;

    // Ajouté pour la vérification d'intégrité avant modification
    @OneToMany(mappedBy = "installmentSchedule")
    @Builder.Default
    private List<InstallmentSchedulePayment> payments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id")
    private Level level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private Option option;
}
