import api from '../api';

/**
 * Service de gestion des cours pour l'espace étudiant.
 * Gère la communication dynamique avec les endpoints du backend.
 */
const MyStudentCoursesService = {
    /**
     * Récupère la liste des matières programmées ainsi que le nom de la classe de l'élève connecté.
     * @returns {Promise<{courses: Array, classroomDisplayName: String}>} Objet contenant le tableau de cours et la classe
     */
    getMyCourses: async () => {
        try {
            const response = await api.get('/academic/subjects/my-courses');
            
            // On extrait l'en-tête injecté par le Backend contenant le nom de la classe
            // Axios convertit généralement les en-têtes en minuscules
            const classroomName = response.headers['x-classroom-display-name'] || 
                                  response.headers['X-Classroom-Display-Name'] || 
                                  '';
                                  
            // On retourne un objet structuré plutôt qu'un simple tableau
            return {
                courses: response.data,
                classroomDisplayName: classroomName
            };
        } catch (error) {
            console.error("Erreur lors de la récupération des cours de l'élève:", error);
            throw error;
        }
    }
};

export default MyStudentCoursesService;