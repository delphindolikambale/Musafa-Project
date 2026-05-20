package com.school.management.dto.financial;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor

public class CashBookDashboardDTO {

    // Totaux pour les cartes de l'interface
    private BigDecimal totalEntriesUSD;
    private BigDecimal totalEntriesCDF;

    private BigDecimal totalExitsUSD;
    private BigDecimal totalExitsCDF;

    private BigDecimal netBalanceUSD; // Solde réel physique
    private BigDecimal netBalanceCDF;

    // Pour information (Flux de trésorerie)
    private BigDecimal balanceScolariteUSD;
    private BigDecimal balanceDiversUSD;
}
