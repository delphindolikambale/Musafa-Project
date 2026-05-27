import api from '../api'; // Ajuste ce chemin pour pointer vers ton fichier api.js global

const schoolConfigServiceObj = {
    /**
     * Récupère la configuration globale de l'école (Nom, Logo, etc.)
     * Aligné strictement sur la méthode du contrôleur Backend (getConfig)
     */
    getConfig: async () => {
        try {
            // L'instance 'api' gère déjà l'URL de base et le JWT
            const response = await api.get('/v1/admin/school-config');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la configuration de l'école:", error);
            throw error;
        }
    },

    /**
     * Alias de compatibilité pour sécuriser d'éventuels autres appels
     */
    getSchoolConfig: async () => {
        try {
            const response = await api.get('/v1/admin/school-config');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la configuration de l'école:", error);
            throw error;
        }
    },

    /**
     * Création initiale de la configuration
     */
    createSchoolConfig: async (configData) => {
        try {
            const response = await api.post('/v1/admin/school-config', configData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la configuration:", error);
            throw error;
        }
    },

    /**
     * Mise à jour de la configuration existante
     */
    updateSchoolConfig: async (configData) => {
        try {
            const response = await api.put('/v1/admin/school-config', configData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la configuration:", error);
            throw error;
        }
    }
};

export const schoolConfigService = schoolConfigServiceObj;
export default schoolConfigServiceObj;