import api from '../api';

const TitulaireService = {
    getMyClassrooms: async (teacherId, academicYearId = null) => {
        const url = academicYearId 
            ? `/titulaire/my-classrooms/teacher/${teacherId}?academicYearId=${academicYearId}`
            : `/titulaire/my-classrooms/teacher/${teacherId}`;
        const response = await api.get(url);
        return response.data;
    },

    getMonitoring: async (classroomId, period, academicYearId) => {
        const response = await api.get(`/titulaire/monitoring/classroom/${classroomId}/period/${period}?academicYearId=${academicYearId}`);
        return response.data;
    },

    generateBulletins: async (classroomId, period, academicYearId) => {
        const response = await api.post(`/titulaire/monitoring/classroom/${classroomId}/period/${period}/generate?academicYearId=${academicYearId}`);
        return response.data;
    },

    // ✅ NOUVEAU : Récupère les "Dossiers" des classes (générés par le Proviseur)
    getBulletinFolders: async (teacherId, academicYearId, schoolId) => {
        const response = await api.get(`/bulletins/titulaire/folders`, {
            params: { teacherId, academicYearId, schoolId }
        });
        return response.data;
    },

    // ✅ NOUVEAU : Récupère la liste des élèves à l'intérieur du dossier sélectionné
    getStudentsInFolder: async (classroomId, academicYearId, schoolId) => {
        const response = await api.get(`/bulletins/titulaire/folders/${classroomId}/students`, {
            params: { academicYearId, schoolId }
        });
        return response.data;
    }
};

export default TitulaireService;