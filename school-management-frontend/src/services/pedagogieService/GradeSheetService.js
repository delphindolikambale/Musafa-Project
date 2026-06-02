import axios from 'axios';
import { BACKEND_BASE } from '../api';

const API_BASE_URL = BACKEND_BASE;
const API_URL = `${API_BASE_URL}/api/v1/grade-sheets`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const GradeSheetService = {
    getStudentSheet: async (studentId, yearId, semester = 1) => {
        const response = await axios.get(`${API_URL}/student/${studentId}/year/${yearId}?semester=${semester}`, { headers: getHeader() });
        return response.data;
    },

    getClassMatrixSheet: async (taId) => {
        const response = await axios.get(`${API_URL}/assignment/${taId}/matrix`, { headers: getHeader() });
        return response.data;
    },

    submitGradeSheetForVisa: async (taId, period) => {
        const response = await axios.post(`${API_URL}/assignment/${taId}/period/${period}/submit`, {}, { headers: getHeader() });
        return response.data;
    },

    getGradeSheetVisaStatus: async (taId, period) => {
        const response = await axios.get(`${API_URL}/assignment/${taId}/period/${period}/visa-status`, { headers: getHeader() });
        return response.data;
    },

    getPendingGradeSheetsForProviseur: async (academicYearId) => {
        const response = await axios.get(`${API_URL}/pending-visa/year/${academicYearId}`, { headers: getHeader() });
        return response.data;
    },

    // --- ADAPTÉ : Validation ---
    validateGradeSheet: async (taId, period) => {
        const response = await axios.post(`${API_URL}/assignment/${taId}/period/${period}/validate`, {}, { headers: getHeader() });
        return response.data;
    },

    // --- ADAPTÉ : Envoi du motif de rejet dans le corps JSON (RequestBody) ---
    rejectGradeSheet: async (taId, period, comment) => {
        const response = await axios.post(
            `${API_URL}/assignment/${taId}/period/${period}/reject`, 
            { comment: comment }, 
            { headers: getHeader() }
        );
        return response.data;
    }
};

export default GradeSheetService;