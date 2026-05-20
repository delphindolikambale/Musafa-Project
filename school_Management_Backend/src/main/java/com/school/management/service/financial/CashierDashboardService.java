package com.school.management.service.financial;

import com.school.management.dto.financial.CashierDashboardDTO;

public interface CashierDashboardService {
    /**
     * Calcule toutes les statistiques globales pour une année académique donnée.
     */
    CashierDashboardDTO getGlobalStats(Long academicYearId);
}
