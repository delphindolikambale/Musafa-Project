import axios from 'axios';

const HISTORY_BASE_URL = 'http://localhost:8080/api/v1/financial/history';

const historyApi = axios.create({
    baseURL: HISTORY_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

historyApi.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
});

export const transactionHistoryService = {
    /**
     * @param {string} type - 'Tout', 'Aujourd'hui', 'Entrées' ou 'Sorties'
     */
    getHistory: async (type = 'Tout') => {
        try {
            const response = await historyApi.get('', { 
                params: { type: type } 
            });
            return response.data;
        } catch (error) {
            console.error("Erreur historique API:", error);
            throw error;
        }
    },

    deleteTransaction: async (id) => {
        try {
            await historyApi.delete(`/${id}`);
        } catch (error) {
            console.error("Erreur suppression API:", error);
            throw error;
        }
    }
};