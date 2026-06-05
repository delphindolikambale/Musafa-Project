import api from '../api';

const TitulaireService = {
    /**
     * Récupère la liste des classes dont l'enseignant connecté est le titulaire.
     * @param {number} teacherId - L'ID de l'enseignant (ou du User selon votre logique Backend)
     * @param {number} academicYearId - L'ID de l'année académique active (optionnel)
     */
    getMyClassrooms: async (teacherId, academicYearId = null) => {
        const url = academicYearId 
            ? `/titulaire/my-classrooms/teacher/${teacherId}?academicYearId=${academicYearId}`
            : `/titulaire/my-classrooms/teacher/${teacherId}`;
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Récupère la matrice de suivi des fiches de notes pour une classe et une période données.
     * @param {number} classroomId - L'ID de la classe
     * @param {number} period - Le numéro de la période (ex: 1, 2, 3...)
     * @param {number} academicYearId - L'ID de l'année académique
     */
    getMonitoring: async (classroomId, period, academicYearId) => {
        const response = await api.get(`/titulaire/monitoring/classroom/${classroomId}/period/${period}?academicYearId=${academicYearId}`);
        return response.data;
    }
};

export default TitulaireService;