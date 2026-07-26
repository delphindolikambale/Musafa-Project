package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardDTO {

    // --- ACTEURS & PÉDAGOGIE ---
    private long totalStudents;
    private long totalBoys;
    private long totalGirls;

    private long totalReenrolled;
    private long totalReenrolledBoys;
    private long totalReenrolledGirls;

    private long totalTeachers;
    private long totalMaleTeachers;   // NOUVEAU : Total hommes
    private long totalFemaleTeachers; // NOUVEAU : Total femmes
    private long totalClasses;

    private long connectedUsers;

    // --- FINANCES (Multi-devises USD & CDF) ---
    private BigDecimal totalExpectedRevenueUSD;
    private BigDecimal totalRecoveredUSD;
    private BigDecimal totalExpensesUSD;
    private BigDecimal actualCashBalanceUSD;

    private BigDecimal totalExpectedRevenueCDF;
    private BigDecimal totalRecoveredCDF;
    private BigDecimal totalExpensesCDF;
    private BigDecimal actualCashBalanceCDF;

    private double recoveryRateUSD;
    private double recoveryRateCDF;

    // --- DONNÉES POUR LES GRAPHIQUES (Recharts / Chart.js) ---
    private Map<String, Long> studentsByClass;
    private Map<String, Long> previousYearStudentsByClass;
    private Map<String, Long> enrollmentEvolution;
    private Map<String, Long> genderRatio;
}