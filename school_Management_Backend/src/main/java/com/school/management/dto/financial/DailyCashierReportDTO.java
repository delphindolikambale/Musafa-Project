package com.school.management.dto.financial;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder

public class DailyCashierReportDTO {

    // Totaux Globaux
    private BigDecimal totalCollectedCdf;
    private BigDecimal totalCollectedUsd;

    // Statistiques de volume
    private long transactionCount;

    // Ventilations Scolarité
    private BigDecimal scolariteCdf;
    private BigDecimal scolariteUsd;

    // Ventilations Divers
    private BigDecimal diversCdf;
    private BigDecimal diversUsd;
}
