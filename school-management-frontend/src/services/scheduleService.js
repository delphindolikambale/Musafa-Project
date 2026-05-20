import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/v1/schedule-fees";

// Configuration de l'instance pour inclure le token si nécessaire
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
});

export const scheduleService = {
    // Récupère tous les barèmes de l'année active
    getAll: async () => {
        const response = await apiClient.get("");
        return response.data;
    },

    // Récupère un barème par son ID
    getById: async (id) => {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    },

    // CRUCIAL : Cette méthode déclenche la synchronisation automatique côté Backend
    update: async (id, scheduleData) => {
        const response = await apiClient.put(`/${id}`, scheduleData);
        return response.data;
    },

    // Récupère les tranches configurées pour un barème spécifique
    getInstallmentsBySchedule: async (scheduleFeesId) => {
        const response = await apiClient.get(`/${scheduleFeesId}/installments`);
        return response.data;
    }
};