package com.school.management.model.financial;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_financial_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentFinancialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "account_number", nullable = false, unique = true, length = 100)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Column(nullable = false)
    private LocalDate openedAt;

    /**
     * Logique métier : Génération du numéro de compte (Matricule + NumPermanent)
     * Exemple : Matricule 123 + DRC-009DG -> 123DRC-009DG
     */
    public static String generateAccountNumber(String matricule, String permanentNumber) {
        if (matricule == null || permanentNumber == null) return null;
        // On garde le format exact demandé : concaténation pure sans modification du Numéro Permanent
        return matricule.trim() + permanentNumber.trim();
    }

}
