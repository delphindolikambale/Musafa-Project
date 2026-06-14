package com.school.management.dto.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyFinancialStatusDTO {
    private String accountNumber;
    private String academicYear;
    private String className;

    // Résumé financier
    private BigDecimal totalAmountDue;
    private BigDecimal totalAmountPaid;
    private BigDecimal balance;
    private String currency;

    // Évolutions des paiements par tranche
    private List<MyInstallmentStatusDTO> installments;

    // Historique des mouvements
    private List<MyPaymentTransactionDTO> paymentHistory;
}