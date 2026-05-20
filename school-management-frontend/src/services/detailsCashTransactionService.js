import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cash-journal';

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

export const detailsCashTransactionService = {
    /**
     * Récupère toutes les lignes du journal pour une année académique.
     * @param {string} academicYear - Le label de l'année (ex: 2026-2027)
     */
    getJournalDetails: async (academicYear) => {
        try {
            const response = await axios.get(`${API_URL}/${encodeURIComponent(academicYear)}`, { 
                headers: getHeader() 
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de transactions:", error);
            throw error;
        }
    }
};