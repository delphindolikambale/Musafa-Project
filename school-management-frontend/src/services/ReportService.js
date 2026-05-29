import api from './api'; // ✅ Utilisation de l'instance centralisée avec détection d'environnement

const API_PATH = "/reports"; 

const ReportService = {
    /**
     * Récupère la structure des dossiers (Années > Classes)
     */
    getStructure: async () => {
        try {
            // L'URL de base (Render ou localhost) est gérée par api.js
            const response = await api.get(`${API_PATH}/structure`);
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
            const response = await api.get(`${API_PATH}/classroom-detail/${classroomId}/${yearId}`);
            // On retourne les données de ClassroomReportDetailDTO
            return response.data;
        } catch (error) {
            console.error("Erreur Service Spring Boot (Détails Classe):", error);
            throw error;
        }
    }
};

export default ReportService;