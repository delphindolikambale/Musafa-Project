import axios from 'axios';

const API_URL = "http://localhost:8080/api/register-student-dashboard";

export const RegisterStudentDashboardService = {
    /**
     * Récupère les statistiques consolidées pour le tableau de bord
     */
    getStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error("Erreur service RegisterStudentDashboard:", error);
            throw error;
        }
    }
};

export default RegisterStudentDashboardService;