// src/services/CashierDashboardService.js
import api, { BACKEND_BASE } from './api'; // ✅ Importation de l'instance API centralisée

const API_PATH = "/v1/dashboard"; // ✅ Chemin relatif de l'API (l'URL de base est gérée par api.js)

export const CashierDashboardService = {
    /**
     * Récupère les statistiques globales de la caisse pour l'année en cours
     * @param {number} academicYearId - L'identifiant de l'année académique active
     */
    getDashboardStats: async (academicYearId) => {
        try {
            // ✅ Utilisation de l'instance 'api' (qui gère automatiquement Render vs localhost et le token JWT)
            const response = await api.get(`${API_PATH}/cashier-stats?academicYearId=${academicYearId}`);
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