import api from './api'; // ✅ MODIFICATION : Migration vers l'instance centrale api

export const scheduleService = {
    // Récupère tous les barèmes de l'année active
    getAll: async () => {
        const response = await api.get("/v1/schedule-fees");
        return response.data;
    },

    // Récupère un barème par son ID
    getById: async (id) => {
        const response = await api.get(`/v1/schedule-fees/${id}`);
        return response.data;
    },

    // CRUCIAL : Cette méthode déclenche la synchronisation automatique côté Backend
    update: async (id, scheduleData) => {
        const response = await api.put(`/v1/schedule-fees/${id}`, scheduleData);
        return response.data;
    },

    // Récupère les tranches configurées pour un barème spécifique
    getInstallmentsBySchedule: async (scheduleFeesId) => {
        const response = await api.get(`/v1/schedule-fees/${scheduleFeesId}/installments`);
        return response.data;
    }
};