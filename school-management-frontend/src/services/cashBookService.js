import api from './api'; // ✅ MODIFICATION : Branchement sur l'instance centrale (URL dynamique + Intercepteur JWT)

export const cashBookService = {
    recordTransaction: async (transactionData) => {
        const response = await api.post('/financial/cash-book/transaction', transactionData);
        return response.data;
    },

    getCashBookJournal: async (yearId, filterType, currentDate) => {
        // Ajout des paramètres de filtre pour la requête
        const params = new URLSearchParams();
        if (filterType) params.append('filterType', filterType);
        if (currentDate) params.append('currentDate', currentDate);

        const response = await api.get(`/financial/cash-book/livre-recap/${yearId}?${params.toString()}`);
        return response.data;
    },

    getDashboardData: async (yearId, filterType, currentDate) => {
        // Ajout des paramètres de filtre pour la requête
        const params = new URLSearchParams();
        if (filterType) params.append('filterType', filterType);
        if (currentDate) params.append('currentDate', currentDate);

        const response = await api.get(`/financial/cash-book/dashboard/${yearId}?${params.toString()}`);
        return response.data;
    },

    // Fonction de synchronisation
    syncJournal: async () => {
        const response = await api.post('/financial/cash-book/sync', {});
        return response.data;
    },

    // Récupérer la configuration de l'école (En-tête, Caissier par défaut, Logo)
    getSchoolConfig: async () => {
        try {
            // L'appel se fait directement sur la route relative nettoyée de /api
            const response = await api.get('/v1/admin/school-config');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la configuration de l'école:", error);
            return null; // Retourne null en cas d'erreur pour ne pas bloquer l'interface
        }
    }
};