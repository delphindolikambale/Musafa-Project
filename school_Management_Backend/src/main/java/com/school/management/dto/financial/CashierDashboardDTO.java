package com.school.management.dto.financial;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class CashierDashboardDTO {
    // Libellé de l'année affichée
    private String academicYearLabel;

    // Les 4 Cartes (KPIs) - Séparées par devise
    private BigDecimal totalExpectedUsd;
    private BigDecimal totalExpectedCdf;

    private BigDecimal totalReceivedUsd;
    private BigDecimal totalReceivedCdf;

    private BigDecimal totalDebtsUsd;
    private BigDecimal totalDebtsCdf;

    private BigDecimal totalExpensesUsd;
    private BigDecimal totalExpensesCdf;

    private BigDecimal netCashUsd;
    private BigDecimal netCashCdf;

    // Graphique 1 : Évolution Mensuelle
    private List<MonthlyFlowDTO> monthlyFlows;

    // Graphique 2 : Performance par classe
    private List<ClassPerformanceDTO> classPerformances;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class MonthlyFlowDTO {
        private String month;
        private BigDecimal incomeUsd;
        private BigDecimal incomeCdf;
        private BigDecimal expensesUsd;
        private BigDecimal expensesCdf;
    }

    @Data @AllArgsConstructor
    public static class ClassPerformanceDTO {
        private String className;
        private Double ratio; // Pourcentage de recouvrement global
    }

}
