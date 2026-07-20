import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Configuration d'une instance Axios dédiée pour centraliser les appels 
 * et gérer automatiquement l'injection du token JWT pour les routes sécurisées.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour injecter automatiquement le Token JWT du Super Admin à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ Fonction utilitaire pour résoudre l'URL du logo système
export const getSystemLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080/${path}`;
};

const SuperAdminSystemService = {

    // =========================================================================
    // 🔓 ENDPOINTS PUBLICS : Sans authentification requise
    // =========================================================================

    // ✅ CORRECTION : Utilisation d'axios pur pour éviter l'injection du token élève
    // qui pourrait causer un conflit de rôle avec Spring Security sur ce contrôleur.
    getPublicSettings: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/system-admin/public/settings`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    activateSchool: async (schoolCode, activationCode) => {
        try {
            const response = await api.post('/auth/schools/activate', {
                schoolCode,
                activationCode
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // =========================================================================
    // 👑 ENDPOINTS SUPER ADMIN : Gestion globale du parc d'établissements
    // =========================================================================

    createSchool: async (schoolData) => {
        try {
            const response = await api.post('/system-admin/schools', schoolData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Collecte et historisation du paiement d'abonnement (Cash ou Mobile Money)
    collectSubscriptionPayment: async (schoolId, paymentData) => {
        try {
            const response = await api.post(`/system-admin/schools/${schoolId}/pay-subscription`, paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getAllSchools: async () => {
        try {
            const response = await api.get('/system-admin/schools');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    toggleAccess: async (id, active) => {
        try {
            const response = await api.put(`/system-admin/schools/${id}/toggle`, null, {
                params: { active }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    renewSchoolSubscription: async (id, months) => {
        try {
            const response = await api.post(`/system-admin/schools/${id}/renew`, null, {
                params: { months }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // =========================================================================
    // ⚙️ ENDPOINTS CONFIGURATION SYSTEME : Personnalisation de la plateforme
    // =========================================================================

    getSettings: async () => {
        try {
            const response = await api.get('/system-admin/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateSettings: async (applicationName, logo) => {
        try {
            const formData = new FormData();
            formData.append('applicationName', applicationName);
            if (logo) {
                formData.append('logo', logo);
            }

            const response = await api.post('/system-admin/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default SuperAdminSystemService;