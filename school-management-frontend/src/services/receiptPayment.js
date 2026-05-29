import axios from 'axios';
import { BACKEND_BASE } from './api'; // ✅ Importation de la base URL dynamique

const RECEIPT_BASE_URL = `${BACKEND_BASE}/api/v1/financial/receipts`; // ✅ Rendu dynamique

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