import api from './api';

export const cashReceiptService = {
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
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