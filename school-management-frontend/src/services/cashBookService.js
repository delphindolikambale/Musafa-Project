import axios from 'axios';

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const isRender = window.location.hostname.includes('onrender.com');

const API_URL = isRender
  ? 'https://musafa-projectbackend.onrender.com/api/financial/cash-book'
  : 'http://localhost:8080/api/financial/cash-book';

// CORRECTION : Ajout de /v1/ pour correspondre exactement au chemin du @RequestMapping du Backend
const CONFIG_API_URL = isRender
  ? 'https://musafa-projectbackend.onrender.com/api/v1/admin/school-config'
  : 'http://localhost:8080/api/v1/admin/school-config'; 

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

export const cashBookService = {
    recordTransaction: async (transactionData) => {
        const response = await axios.post(`${API_URL}/transaction`, transactionData, { headers: getHeader() });
        return response.data;
    },

    getCashBookJournal: async (yearId, filterType, currentDate) => {
        // Ajout des paramètres de filtre pour la requête
        const params = new URLSearchParams();
        if (filterType) params.append('filterType', filterType);
        if (currentDate) params.append('currentDate', currentDate);

        const response = await axios.get(`${API_URL}/livre-recap/${yearId}?${params.toString()}`, { headers: getHeader() });
        return response.data;
    },

    getDashboardData: async (yearId, filterType, currentDate) => {
        // Ajout des paramètres de filtre pour la requête
        const params = new URLSearchParams();
        if (filterType) params.append('filterType', filterType);
        if (currentDate) params.append('currentDate', currentDate);

        const response = await axios.get(`${API_URL}/dashboard/${yearId}?${params.toString()}`, { headers: getHeader() });
        return response.data;
    },

    // Fonction de synchronisation
    syncJournal: async () => {
        const response = await axios.post(`${API_URL}/sync`, {}, { headers: getHeader() });
        return response.data;
    },

    // Récupérer la configuration de l'école (En-tête, Caissier par défaut, Logo)
    getSchoolConfig: async () => {
        try {
            // CORRECTION : Suppression de '/active'. 
            // L'appel se fait directement sur CONFIG_API_URL car le backend a un @GetMapping sans paramètre supplémentaire.
            const response = await axios.get(`${CONFIG_API_URL}`, { headers: getHeader() });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la configuration de l'école:", error);
            return null; // Retourne null en cas d'erreur pour ne pas bloquer l'interface
        }
    }
};