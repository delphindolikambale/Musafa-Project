package com.school.management.model.multitenant;

import com.school.management.model.enums.SubscriptionStatus;
import com.school.management.model.enums.Currency;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    private Integer maxStudentsAllowed;

    // ✅ NOUVEAUX CHAMPS FINANCIERS : Historisation du paiement effectué par le Super Admin

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "amount")
    private Double amount;

    // Mode de paiement: "CASH", "AIRTEL_MONEY", "MPESA", "ORANGE_MONEY", "CARTE_BANCAIRE"
    @Column(name = "payment_mode", length = 50)
    private String paymentMode;

    // Devise utilisée
    @Enumerated(EnumType.STRING)
    @Column(name = "currency", length = 10)
    private Currency currency;
}