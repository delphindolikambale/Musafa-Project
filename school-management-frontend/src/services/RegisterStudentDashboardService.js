import api from './api';

const API_URL = "/register-student-dashboard";

export const RegisterStudentDashboardService = {
    /**
     * Récupère les statistiques consolidées pour le tableau de bord
     */
    getStats: async () => {
        try {
            const response = await api.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error("Erreur service RegisterStudentDashboard:", error);
            throw error;
        }
    }
};

export default RegisterStudentDashboardService;