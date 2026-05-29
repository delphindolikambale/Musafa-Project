import api from './api';

export const transactionHistoryService = {
    /**
     * @param {string} type - 'Tout', 'Aujourd'hui', 'Entrées' ou 'Sorties'
     */
    getHistory: async (type = 'Tout') => {
        try {
            // L'URL de base de api.js pointe déjà sur /api, donc on met juste la suite du chemin
            const response = await api.get('/v1/financial/history', { 
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
            await api.delete(`/v1/financial/history/${id}`);
        } catch (error) {
            console.error("Erreur suppression API:", error);
            throw error;
        }
    }
};