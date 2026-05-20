package com.school.management.model.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "details_cash_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class DetailsCashTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String academicYear; // ex: 2025-2026

    @Column(nullable = false)
    private String month; // ex: AVRIL

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // ENTREE | SORTIE

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // Motif détaillé

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String actor; // Nom complet + Classe (Elève) OU Nom complet + Fonction (Autorité)

    @Column(nullable = false)
    private String documentNumber; // Numéro de Reçu ou de Bon de Sortie
}
