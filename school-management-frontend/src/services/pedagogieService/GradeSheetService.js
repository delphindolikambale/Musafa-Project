import axios from 'axios';
import { BACKEND_BASE } from '../api';

const API_BASE_URL = BACKEND_BASE;
const API_URL = `${API_BASE_URL}/api/v1/grade-sheets`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const GradeSheetService = {
    // Récupérer le bulletin d'un élève (Toutes les matières)
    getStudentSheet: async (studentId, yearId, semester = 1) => {
        const response = await axios.get(`${API_URL}/student/${studentId}/year/${yearId}?semester=${semester}`, { headers: getHeader() });
        return response.data;
    },

    // Fiche de Cotes de toute la classe (Matrice d'affichage globale)
    getClassMatrixSheet: async (taId) => {
        const response = await axios.get(`${API_URL}/assignment/${taId}/matrix`, { headers: getHeader() });
        return response.data;
    }
};

export default GradeSheetService;