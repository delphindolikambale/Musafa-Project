import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/student-payments';

const paymentApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

paymentApi.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
});

export const paymentService = {
    getDailyReport: async () => {
        const response = await paymentApi.get("/daily-report");
        return response.data;
    },

    getAllPayments: async () => {
        const response = await paymentApi.get("");
        return response.data;
    },

    getStudentSummary: async (identifier) => {
        if (!identifier) throw new Error("Identifiant manquant");
        const response = await paymentApi.get(`/summary/${identifier}`);
        return response.data;
    },

    processPayment: async (paymentData) => {
        const response = await paymentApi.post("", paymentData);
        return response.data;
    },

    searchStudents: async (query) => {
        if (!query) return []; 
        const response = await paymentApi.get(`/search-students?q=${query}`);
        return response.data; 
    },

    getPaymentByReceipt: async (receiptNumber) => {
        const response = await paymentApi.get(`/receipt/${receiptNumber}`);
        return response.data;
    }
};