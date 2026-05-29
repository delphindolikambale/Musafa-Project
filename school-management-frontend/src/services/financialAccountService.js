import axios from 'axios';
import { BACKEND_BASE } from './api'; // ✅ Importation de la base URL dynamique

const API_BASE_URL = `${BACKEND_BASE}/api/v1/financial-accounts`; // ✅ Rendu dynamique

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

const formatAccountData = (acc) => {
    if (!acc) return null;
    
    let safeDate = acc.openedAt;
    if (Array.isArray(acc.openedAt) && acc.openedAt.length >= 3) {
        safeDate = new Date(acc.openedAt[0], acc.openedAt[1] - 1, acc.openedAt[2]).toISOString();
    }

    return {
        ...acc,
        studentFullName: acc.studentFullName || (acc.student ? `${acc.student.lastName} ${acc.student.firstName}` : 'ÉLÈVE INCONNU'),
        openedAt: safeDate
    };
};

const financialAccountService = {
    getAllAccounts: async () => {
        try {
            const response = await apiClient.get(""); 
            return (response.data || []).map(formatAccountData);
        } catch (error) {
            console.error("Erreur récupération comptes:", error);
            throw error;
        }
    },

    getFullDetailsByNumber: async (accountNumber) => {
        try {
            const response = await apiClient.get(`/details/${accountNumber}`);
            return formatAccountData(response.data);
        } catch (error) {
            console.error("Erreur détails compte:", error);
            throw error;
        }
    },

    searchAccounts: async (keyword) => {
        try {
            const response = await apiClient.get(`/search?keyword=${keyword}`);
            return (response.data || []).map(formatAccountData);
        } catch (error) {
            console.error("Erreur recherche:", error);
            throw error;
        }
    },

    getAnnualProfilesByAccountId: async (accountId) => {
        if (!accountId) return [];
        try {
            const response = await apiClient.get(`/${accountId}/profiles`);
            const profiles = response.data || [];
            return profiles.map(p => ({
                ...p,
                totalAmountDue: Number(p.totalAmountDue || 0),
                totalAmountPaid: Number(p.totalAmountPaid || 0),
                balance: Number(p.balance || 0),
                // Adaptation pour inclure la ventilation détaillée (breakdown)
                feeBreakdown: (p.feeBreakdown || []).map(group => ({
                    ...group,
                    calculatedAmount: Number(group.calculatedAmount || 0),
                    paidAmount: Number(group.paidAmount || 0), // Nouveau: montant payé sur ce groupe
                    feesItems: (group.feesItems || []).map(item => ({
                        ...item,
                        calculatedAmount: Number(item.calculatedAmount || 0),
                        paidAmount: Number(item.paidAmount || 0) // Nouveau: montant payé sur cet item précis
                    }))
                })),
                installments: (p.installments || []).map(inst => ({
                    ...inst,
                    amountPaid: Number(inst.amountPaid || 0),
                    amount: Number(inst.amount || 0),
                    status: inst.status || 'PENDING'
                }))
            }));
        } catch (error) {
            console.error("Erreur API profils:", error);
            return [];
        }
    }
};

export default financialAccountService;