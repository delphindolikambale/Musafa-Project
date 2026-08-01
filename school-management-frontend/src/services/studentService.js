import api from './api';

const API_URL = "/students";

export const studentService = {
    getAll: async () => {
        const response = await api.get(API_URL);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post(API_URL, data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`${API_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`${API_URL}/${id}`);
    },
    toggleStatus: async (id, newStatus) => {
        const response = await api.patch(`${API_URL}/${id}/status?status=${newStatus}`);
        return response.da-ta;
    },
    
    // --- NOUVEAUX ENDPOINTS POUR LA SÉCURISATION DE L'ESPACE ÉLÈVE ---
    linkAccount: async (userId, matricule, schoolPassword) => {
        const response = await api.post(`${API_URL}/link-account`, {
            userId: userId,
            matricule: matricule,
            schoolPassword: schoolPassword
        });
        return response.data;
    },
    getStudentByUserId: async (userId) => {
        const response = await api.get(`${API_URL}/user/${userId}`);
        return response.data;
    }
};

export default studentService;