import api from '../api'; // ✅ MODIFICATION : Utilisation de l'instance centralisée

const API_EVAL = '/v1/evaluations'; // ✅ Les préfixes /api obsolètes sont gérés par l'instance centrale
const API_MARKS = '/v1/marks';
const API_TA = '/teacher-assignments';

const EvaluationService = {
    saveEvaluation: async (dto) => {
        const response = await api.post(`${API_EVAL}/save-marks`, dto);
        return response.data;
    },

    getEvaluationsByAssignment: async (taId, period) => {
        const response = await api.get(`${API_EVAL}/assignment/${taId}/period/${period}`);
        return response.data;
    },

    getCurrentSum: async (taId, period) => {
        const response = await api.get(`${API_EVAL}/current-sum/${taId}/${period}`);
        return response.data;
    },

    updateMark: async (markId, value) => {
        const response = await api.put(`${API_MARKS}/${markId}?value=${value}`, {});
        return response.data;
    },

    getMarksByEvaluationTask: async (taskId) => {
        const response = await api.get(`${API_MARKS}/evaluation/${taskId}`);
        return response.data;
    },

    submitForVisa: async (teacherAssignmentId, period) => {
        const response = await api.post(`${API_EVAL}/assignment/${teacherAssignmentId}/period/${period}/submit`, {});
        return response.data;
    },

    getVisaStatus: async (teacherAssignmentId, period) => {
        const response = await api.get(`${API_EVAL}/assignment/${teacherAssignmentId}/period/${period}/visa-status`);
        return response.data;
    },

    getTeacherAssignmentById: async (taId) => {
        const response = await api.get(`${API_TA}/${taId}`);
        return response.data;
    },

    getAssignmentConfig: async (taId) => {
        const response = await api.get(`${API_EVAL}/assignment/${taId}/config`);
        return response.data;
    }
};

export default EvaluationService;