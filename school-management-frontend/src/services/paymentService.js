import api from './api'; // ✅ MODIFICATION : Nettoyage de l'instance locale redondante au profit de l'instance globale

export const paymentService = {
    getDailyReport: async () => {
        const response = await api.get("/v1/student-payments/daily-report");
        return response.data;
    },

    getAllPayments: async () => {
        const response = await api.get("/v1/student-payments");
        return response.data;
    },

    getStudentSummary: async (identifier) => {
        if (!identifier) throw new Error("Identifiant manquant");
        const response = await api.get(`/v1/student-payments/summary/${identifier}`);
        return response.data;
    },

    processPayment: async (paymentData) => {
        const response = await api.post("/v1/student-payments", paymentData);
        return response.data;
    },

    searchStudents: async (query) => {
        if (!query) return []; 
        const response = await api.get(`/v1/student-payments/search-students?q=${query}`);
        return response.data; 
    },

    getPaymentByReceipt: async (receiptNumber) => {
        const response = await api.get(`/v1/student-payments/receipt/${receiptNumber}`);
        return response.data;
    }
};