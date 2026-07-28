import api from './api';

const ProviseurService = {
    // Récupère la liste des classes gérées par le Proviseur
    getClasses: async (schoolId) => {
        const response = await api.get('/bulletins/proviseur/classes', {
            params: { schoolId }
        });
        return response.data;
    },

    // Récupère la structure et les données de pré-initialisation de la maquette du bulletin
    getInitData: async (classroomId, academicYearId, schoolId) => {
        const response = await api.get('/bulletins/proviseur/init-data', {
            params: { classroomId, academicYearId, schoolId }
        });
        return response.data;
    },

    // Génère et transmet les dossiers de bulletins au Titulaire
    sendToTitulaire: async (classroomId, academicYearId, schoolId, teacherId = null) => {
        const params = { classroomId, academicYearId, schoolId };
        if (teacherId) {
            params.teacherId = teacherId;
        }
        const response = await api.post('/bulletins/proviseur/initialize', null, { params });
        return response.data;
    }
};

export default ProviseurService;