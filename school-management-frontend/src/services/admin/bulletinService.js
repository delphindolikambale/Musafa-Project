import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getBulletinHeader = async () => {
    try {
        const response = await axios.get(`${API_URL}/bulletin-headers`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'en-tête", error);
        throw error;
    }
};

export const getStudentBulletin = async (studentId, yearId) => {
    try {
        const response = await axios.get(`${API_URL}/bulletins/student/${studentId}/year/${yearId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la génération du bulletin", error);
        throw error;
    }
};

// ✅ AJOUTS SAAS MULTI-TENANT : Endpoints du Proviseur sécurisés par école
export const getClassesForProviseur = async (schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/bulletins/proviseur/classes`, {
            params: { schoolId },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des classes", error);
        throw error;
    }
};

export const getBulletinInitData = async (classroomId, academicYearId, schoolId) => {
    try {
        const response = await axios.get(`${API_URL}/bulletins/proviseur/init-data`, {
            params: { classroomId, academicYearId, schoolId },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'initialisation du bulletin", error);
        throw error;
    }
};

// ✅ NOUVEAU : Fonction pour exécuter l'envoi réel des bulletins au titulaire (avec teacherId)
export const initializeBulletins = async (classroomId, academicYearId, schoolId, teacherId) => {
    try {
        // Remplacer '/initialize' par l'endpoint exact de ton contrôleur Spring Boot si différent
        const response = await axios.post(`${API_URL}/bulletins/proviseur/initialize`, null, {
            params: { classroomId, academicYearId, schoolId, teacherId },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'envoi des bulletins au titulaire", error);
        throw error;
    }
};