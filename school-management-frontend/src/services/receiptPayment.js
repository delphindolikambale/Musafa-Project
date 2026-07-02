import api from './api'; // ✅ MODIFICATION : Utilisation de l'instance api pour éviter les ruptures de Token JWT

export const receiptPaymentService = {
    getReceiptData: async (paymentId) => {
        try {
            const response = await api.get(`/v1/financial/receipts/${paymentId}/data`);
            return response.data;
        } catch (error) {
            console.error("Erreur API Reçu:", error);
            throw error;
        }
    }
};