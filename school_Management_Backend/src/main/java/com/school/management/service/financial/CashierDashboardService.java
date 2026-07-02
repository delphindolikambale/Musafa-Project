package com.school.management.service.financial;

import com.school.management.dto.financial.CashierDashboardDTO;

public interface CashierDashboardService {
    /**
     * Calcule toutes les statistiques globales pour une année académique donnée et une école spécifique.
     */
    CashierDashboardDTO getGlobalStats(Long academicYearId, Long schoolId);
}