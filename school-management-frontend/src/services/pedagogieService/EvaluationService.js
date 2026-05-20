import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";
const API_EVAL = `${API_BASE_URL}/api/v1/evaluations`;
const API_MARKS = `${API_BASE_URL}/api/v1/marks`;
const API_TA = `${API_BASE_URL}/api/teacher-assignments`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const EvaluationService = {
    saveEvaluation: async (dto) => {
        const response = await axios.post(`${API_EVAL}/save-marks`, dto, { headers: getHeader() });
        return response.data;
    },

    getEvaluationsByAssignment: async (taId, period) => {
        const response = await axios.get(`${API_EVAL}/assignment/${taId}/period/${period}`, { headers: getHeader() });
        return response.data;
    },

    getCurrentSum: async (taId, period) => {
        const response = await axios.get(`${API_EVAL}/current-sum/${taId}/${period}`, { headers: getHeader() });
        return response.data;
    },

    updateMark: async (markId, value) => {
        const response = await axios.put(`${API_MARKS}/${markId}?value=${value}`, {}, { headers: getHeader() });
        return response.data;
    },

    getMarksByEvaluationTask: async (taskId) => {
        const response = await axios.get(`${API_MARKS}/evaluation/${taskId}`, { headers: getHeader() });
        return response.data;
    },

    submitForVisa: async (teacherAssignmentId, period) => {
        const response = await axios.post(`${API_EVAL}/assignment/${teacherAssignmentId}/period/${period}/submit`, {}, { headers: getHeader() });
        return response.data;
    },

    getVisaStatus: async (teacherAssignmentId, period) => {
        const response = await axios.get(`${API_EVAL}/assignment/${teacherAssignmentId}/period/${period}/visa-status`, { headers: getHeader() });
        return response.data;
    },

    getTeacherAssignmentById: async (taId) => {
        const response = await axios.get(`${API_TA}/${taId}`, { headers: getHeader() });
        return response.data;
    },

    // NOUVELLE METHODE : Extraction complète de la configuration et des barèmes du cours
    getAssignmentConfig: async (taId) => {
        const response = await axios.get(`${API_EVAL}/assignment/${taId}/config`, { headers: getHeader() });
        return response.data;
    }
};

export default EvaluationService;