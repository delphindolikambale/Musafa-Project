import api from '../api'; // ✅ MODIFICATION : Utilisation de l'instance centralisée

const API_URL = '/v1/grade-sheets'; // ✅ Nettoyage du préfixe /api géré globalement

const GradeSheetService = {
    getStudentSheet: async (studentId, yearId, semester = 1) => {
        const response = await api.get(`${API_URL}/student/${studentId}/year/${yearId}?semester=${semester}`);
        return response.data;
    },

    getClassMatrixSheet: async (taId) => {
        const response = await api.get(`${API_URL}/assignment/${taId}/matrix`);
        return response.data;
    },

    submitGradeSheetForVisa: async (taId, period) => {
        const response = await api.post(`${API_URL}/assignment/${taId}/period/${period}/submit`, {});
        return response.data;
    },

    getGradeSheetVisaStatus: async (taId, period) => {
        const response = await api.get(`${API_URL}/assignment/${taId}/period/${period}/visa-status`);
        return response.data;
    },

    getPendingGradeSheetsForProviseur: async (academicYearId) => {
        const response = await api.get(`${API_URL}/pending-visa/year/${academicYearId}`);
        return response.data;
    },

    // --- ADAPTÉ : Validation ---
    validateGradeSheet: async (taId, period) => {
        const response = await api.post(`${API_URL}/assignment/${taId}/period/${period}/validate`, {});
        return response.data;
    },

    // --- ADAPTÉ : Envoi du motif de rejet dans le corps JSON (RequestBody) ---
    rejectGradeSheet: async (taId, period, comment) => {
        const response = await api.post(
            `${API_URL}/assignment/${taId}/period/${period}/reject`, 
            { comment: comment }
        );
        return response.data;
    }
};

export default GradeSheetService;