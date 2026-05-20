package com.school.management.model.financial;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder

public class TransactionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "IN" pour Entrée (Paiement), "OUT" pour Sortie (Dépense)
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String label; // Ex: "Paiement Frais Scolaires - KAVIRA MBALAN"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Column(unique = true)
    private String referenceNumber; // Le numéro de reçu ou numéro de facture

    private String performedBy; // Le nom du caissier

    // ID de l'entité liée (pour pouvoir retrouver le paiement original)
    private Long sourceId;
}
