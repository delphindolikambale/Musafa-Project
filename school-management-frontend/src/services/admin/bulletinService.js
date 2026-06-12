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