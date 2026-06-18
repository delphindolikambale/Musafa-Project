import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Ajustez l'hôte et le port si nécessaire

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
        // Logique de récupération du token stocké lors du login (localStorage, sessionStorage, etc.)
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

const SuperAdminSystemService = {

    // =========================================================================
    // 🔓 ENDPOINT PUBLIC : Déblocage / Activation de l'établissement
    // =========================================================================

    /**
     * Permet à un administrateur d'établissement d'activer ou réactiver 
     * son école de manière autonome en saisissant le code secret reçu par mail.
     * @param {string} schoolCode - Le code unique de l'école (ex: MUSAFA)
     * @param {string} activationCode - Le code secret d'activation (ex: ACT-XXXX)
     */
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

    /**
     * Enregistre un tout nouvel établissement dans le système SaaS.
     * @param {Object} schoolData - Données de l'école correspondant au SchoolCreateDTO
     */
    createSchool: async (schoolData) => {
        try {
            const response = await api.post('/system-admin/schools', schoolData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Récupère la liste intégrale de toutes les écoles enregistrées 
     * avec le statut de leur abonnement.
     */
    getAllSchools: async () => {
        try {
            const response = await api.get('/system-admin/schools');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Active ou suspend manuellement les accès d'une école depuis le dashboard.
     * Maps to: PUT /api/system-admin/schools/{id}/toggle?active=true|false
     * @param {number|string} id - L'identifiant de l'école
     * @param {boolean} active - Le nouvel état de l'accès
     */
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

    /**
     * Renouvelle ou prolonge l'abonnement d'un établissement d'un nombre de mois donné.
     * Maps to: POST /api/system-admin/schools/{id}/renew?months=X
     * @param {number|string} id - L'identifiant de l'école
     * @param {number} months - Le nombre de mois à ajouter
     */
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

    /**
     * Récupère la configuration générale courante de l'application (Nom, Logo global).
     */
    getSettings: async () => {
        try {
            const response = await api.get('/system-admin/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Met à jour les paramètres de la plateforme (Prise en charge du MultipartFile pour le logo).
     * @param {string} applicationName - Le nouveau nom de la plateforme
     * @param {File|null} logo - Le fichier image du logo (optionnel)
     */
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