import api from '../api';

/**
 * Service gérant la récupération et l'initialisation des bulletins (Proviseur & Éléves)
 */
export const getBulletinHeader = async () => {
    try {
        const response = await api.get('/bulletin-headers');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'en-tête", error);
        throw error;
    }
};

export const getStudentBulletin = async (studentId, yearId) => {
    try {
        const response = await api.get(`/bulletins/student/${studentId}/year/${yearId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la génération du bulletin de l'élève", error);
        throw error;
    }
};

/**
 * Récupère la liste des classes actives pour le ComboBox du Proviseur
 */
export const getClassesForProviseur = async (schoolId) => {
    try {
        const response = await api.get('/bulletins/proviseur/classes', {
            params: { schoolId }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des classes du proviseur", error);
        throw error;
    }
};

/**
 * Récupère la maquette générale du bulletin (Effectif, Titulaire, Maxima P1, P2, EX1, S1, P3, P4, EX2, S2, MAX GEN)
 */
export const getBulletinInitData = async (classroomId, academicYearId, schoolId) => {
    try {
        const response = await api.get('/bulletins/proviseur/init-data', {
            params: { classroomId, academicYearId, schoolId }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors du chargement de la maquette générale du bulletin", error);
        throw error;
    }
};

/**
 * Valide et transmet la maquette générale du bulletin de la classe au Titulaire (avec alerte WebSocket)
 */
export const initializeBulletins = async (classroomId, academicYearId, schoolId, teacherId) => {
    try {
        const response = await api.post('/bulletins/proviseur/initialize', null, {
            params: { classroomId, academicYearId, schoolId, teacherId }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'envoi de la maquette du bulletin au titulaire", error);
        throw error;
    }
};