import axios from 'axios';

const RECEIPT_BASE_URL = 'http://localhost:8080/api/v1/financial/receipts';

export const receiptPaymentService = {
    getReceiptData: async (paymentId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.get(`${RECEIPT_BASE_URL}/${paymentId}/data`, {
                headers: { 
                    Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : ''
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur API Reçu:", error);
            throw error;
        }
    }
};