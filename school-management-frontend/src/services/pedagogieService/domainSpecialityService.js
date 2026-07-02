import api from '../api'; // ✅ MODIFICATION : Utilisation de l'instance centralisée

const domainSpecialityService = {
    /**
     * Récupère la liste complète des spécialités (ex: MATHÉMATIQUES, PHYSIQUE, BIOLOGIE...)
     */
    getAllSpecialities: async () => {
        const response = await api.get('/specialities');
        return response.data;
    },

    /**
     * Récupère le détail d'une spécialité par son ID
     */
    getSpecialityById: async (id) => {
        const response = await api.get(`/specialities/${id}`);
        return response.data;
    },

    /**
     * Crée une nouvelle spécialité dans le référentiel
     */
    createSpeciality: async (data) => {
        const response = await api.post('/specialities', data);
        return response.data;
    },

    /**
     * Supprime une spécialité du référentiel
     */
    deleteSpeciality: async (id) => {
        await api.delete(`/specialities/${id}`);
    }
};

export default domainSpecialityService;