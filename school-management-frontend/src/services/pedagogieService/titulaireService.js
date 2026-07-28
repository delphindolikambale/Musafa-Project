import api from '../api';

/**
 * Service gérant les opérations pédagogiques spécifiques au Titulaire de classe.
 */
const TitulaireService = {
    // Récupère les classes dont l'enseignant est titulaire
    getMyClassrooms: async (teacherId, academicYearId = null) => {
        const url = academicYearId 
            ? `/titulaire/my-classrooms/teacher/${teacherId}?academicYearId=${academicYearId}`
            : `/titulaire/my-classrooms/teacher/${teacherId}`;
        const response = await api.get(url);
        return response.data;
    },

    // Récupère la grille de suivi et d'avancement de la saisie des cotes
    getMonitoring: async (classroomId, period, academicYearId) => {
        const response = await api.get(`/titulaire/monitoring/classroom/${classroomId}/period/${period}`, {
            params: { academicYearId }
        });
        return response.data;
    },

    // Validation d'une fiche matricielle par le Titulaire
    validateFiche: async (classroomId, subjectId, periodId, academicYearId, schoolId) => {
        const response = await api.post('/bulletins/titulaire/validate', null, {
            params: { classroomId, subjectId, periodId, academicYearId, schoolId }
        });
        return response.data;
    },

    // Récupère les dossiers de bulletins générés par le Proviseur
    getBulletinFolders: async (teacherId, academicYearId, schoolId) => {
        const response = await api.get('/bulletins/titulaire/folders', {
            params: { teacherId, academicYearId, schoolId }
        });
        return response.data;
    },

    // Récupère la liste des élèves figurant dans un dossier
    getStudentsInFolder: async (folderId) => {
        const response = await api.get(`/bulletins/titulaire/folders/${folderId}/students`);
        return response.data;
    },

    // Récupère les notifications persistantes pour la cloche du Titulaire
    getNotifications: async (teacherId, schoolId) => {
        const response = await api.get('/bulletins/titulaire/notifications', {
            params: { teacherId, schoolId }
        });
        return response.data;
    },

    // Supprime une notification lue
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/bulletins/titulaire/notifications/${notificationId}`);
        return response.data;
    }
};

export default TitulaireService;