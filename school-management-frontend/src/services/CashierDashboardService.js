// src/services/CashierDashboardService.js
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/v1/dashboard"; 

export const CashierDashboardService = {
    /**
     * Récupère les statistiques globales de la caisse pour l'année en cours
     * @param {number} academicYearId - L'identifiant de l'année académique active
     */
    getDashboardStats: async (academicYearId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cashier-stats?academicYearId=${academicYearId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques du dashboard:", error);
            // Retourne des données à zéro alignées sur la structure du DTO Backend
            return {
                totalExpectedUsd: 0, totalExpectedCdf: 0,
                totalReceivedUsd: 0, totalReceivedCdf: 0,
                totalDebtsUsd: 0, totalDebtsCdf: 0,
                totalExpensesUsd: 0, totalExpensesCdf: 0,
                netCashUsd: 0, netCashCdf: 0,
                monthlyFlows: [],
                classPerformances: []
            };
        }
    }
};