import axios from 'axios';
const API_URL = "http://localhost:8080/api/students";

export const studentService = {
    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(API_URL, data);
        return response.data;
    },
    update: async (id, data) => {
        // On s'assure que l'ID est bien passé dans l'URL
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    },
    // Cette méthode est la plus fiable pour le bouton Active/Suspendu
    toggleStatus: async (id, newStatus) => {
        const response = await axios.patch(`${API_URL}/${id}/status?status=${newStatus}`);
        return response.data;
    }
};