import api from '../api';

/**
 * Service de gestion des cours pour l'espace étudiant.
 * Gère la communication dynamique avec les endpoints du backend.
 */
const MyStudentCoursesService = {
    /**
     * Récupère la liste des matières programmées pour la classe de l'élève connecté.
     * @returns {Promise<AxiosResponse<Array>>} Liste des matières (SubjectResponseDTO)
     */
    getMyCourses: async () => {
        try {
            const response = await api.get('/academic/subjects/my-courses');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des cours de l'élève:", error);
            throw error;
        }
    }
};

export default MyStudentCoursesService;