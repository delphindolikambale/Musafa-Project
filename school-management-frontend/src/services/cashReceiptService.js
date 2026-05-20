import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
});

export const cashReceiptService = {
    getCurrentUser: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user;
        } catch (e) {
            return null;
        }
    },

    getDashboardData: async (filter, date, classroomId) => {
        const response = await api.get("/cash-receipts/summary", {
            params: { filter, date, classroomId: classroomId || null }
        });
        return response.data;
    },

    getReportData: async (filter, date, classroomId) => {
        const response = await api.get("/cash-receipts/summary", {
            params: { filter, date, classroomId: classroomId || null }
        });
        return response.data;
    },

    getClassrooms: async () => {
        const response = await api.get("/classrooms");
        return response.data;
    },

    getSchoolConfig: async () => {
        const response = await api.get("/v1/admin/school-config");
        return response.data;
    }
};