import axios from 'axios';

// ✅ Détection dynamique de l'environnement
const deployeeSurRender = window.location.hostname.includes('onrender.com');
const BACKEND_BASE = deployeeSurRender 
    ? "https://musafa-projectbackend.onrender.com" 
    : "http://localhost:8080";

const API_BASE_URL = `${BACKEND_BASE}/api`;

/**
 * Configuration d'une instance Axios dédiée pour centraliser les appels 
 * et gérer automatiquement l'injection du token JWT pour les routes sécurisées.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
});

// ✅ CORRECTION : Alignement de la logique d'extraction du jeton sur celle de api.js
// Intercepteur pour injecter automatiquement le Token JWT du Super Admin à chaque requête
api.interceptors.request.use(
    (config) => {
        let token = null;

        // 1. Tenter d'extraire le jeton depuis l'objet 'user'
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                token = user?.token || user?.accessToken || user?.jwt;
            } catch (e) {
                token = userStr;
            }
        }

        // 2. Recherche de secours si le token est stocké sous d'autres clés classiques
        if (!token) {
            token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('jwt');
        }

        // 3. Injecter l'en-tête Authorization s'il existe
        if (token) {
            const cleanToken = String(token).replace(/^"(.*)"$/, '$1').trim();
            config.headers['Authorization'] = `Bearer ${cleanToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ CORRECTION : Résolution robuste de l'URL du logo système (supporte liens HTTP, API directes et fichiers)
export const getSystemLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/api') || path.startsWith('api')) {
        return `${BACKEND_BASE}/${path.replace(/^\/+/, '')}`;
    }
    return `${BACKEND_BASE}/api/resources/view?path=${encodeURIComponent(path)}`;
};

const SuperAdminSystemService = {

    // =========================================================================
    // 🔓 ENDPOINTS PUBLICS : Sans authentification requise
    // =========================================================================

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

    // ✅ CORRECTION CRITIQUE : Suppression du header Content-Type explicite
    // Laisse Axios générer le Content-Type 'multipart/form-data; boundary=...' automatiquement.
    updateSettings: async (applicationName, logo) => {
        try {
            const formData = new FormData();
            formData.append('applicationName', applicationName);
            if (logo) {
                formData.append('logo', logo);
            }

            const response = await api.post('/system-admin/settings', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default SuperAdminSystemService;