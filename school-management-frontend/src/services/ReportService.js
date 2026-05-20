import axios from 'axios';

// URL de base de ton API Spring Boot
const API_BASE_URL = "http://localhost:8080/api/reports"; 

const ReportService = {
    /**
     * Récupère la structure des dossiers (Années > Classes)
     */
    getStructure: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/structure`);
            // On retourne directement les données (le tableau de ReportStructureDTO)
            return response.data; 
        } catch (error) {
            console.error("Erreur Service Spring Boot (Structure):", error);
            throw error;
        }
    },

    /**
     * Récupère les détails d'une classe pour l'aperçu avant impression
     * @param {number} classroomId - L'ID de la classe
     * @param {number} yearId - L'ID de l'année scolaire
     */
    getClassroomDetail: async (classroomId, yearId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/classroom-detail/${classroomId}/${yearId}`);
            // On retourne les données de ClassroomReportDetailDTO
            return response.data;
        } catch (error) {
            console.error("Erreur Service Spring Boot (Détails Classe):", error);
            throw error;
        }
    }
};

export default ReportService;