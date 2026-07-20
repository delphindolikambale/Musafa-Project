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
    },

    /**
     * Validation finale de la grille matricielle par le Titulaire.
     * Connecté à BulletinTitulaireController -> @PostMapping("/validate")
     */
    validateFiche: async (classroomId, subjectId, periodId, academicYearId, schoolId) => {
        const params = new URLSearchParams({
            classroomId,
            subjectId,
            periodId,
            academicYearId,
            schoolId
        });
        const response = await api.post(`/bulletins/titulaire/validate?${params.toString()}`);
        return response.data;
    },

    /**
     * Génère l'URL complète pour l'abonnement SSE (EventSource) côté client.
     * Connecté à BulletinTitulaireController -> @GetMapping("/subscribe")
     */
    getSseSubscriptionUrl: (schoolId, teacherId) => {
        const baseUrl = api.defaults.baseURL || 'http://localhost:8080/api';
        return `${baseUrl}/bulletins/titulaire/subscribe?schoolId=${schoolId}&teacherId=${teacherId}`;
    }
};

export default TitulaireService;