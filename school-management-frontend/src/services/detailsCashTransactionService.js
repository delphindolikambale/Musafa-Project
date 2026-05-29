import api from './api';

export const detailsCashTransactionService = {
    /**
     * Récupère toutes les lignes du journal pour une année académique.
     * @param {string} academicYear - Le label de l'année (ex: 2026-2027)
     */
    getJournalDetails: async (academicYear) => {
        try {
            const response = await api.get(`/cash-journal/${encodeURIComponent(academicYear)}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de transactions:", error);
            throw error;
        }
    }
};