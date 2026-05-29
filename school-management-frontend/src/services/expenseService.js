import api from './api';

export const expenseService = {
    createExpense: async (expenseData) => {
        try {
            const response = await api.post('/expenses', expenseData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la dépense:", error);
            throw error;
        }
    },

    getAllExpenses: async () => {
        try {
            const response = await api.get('/expenses');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des dépenses:", error);
            throw error;
        }
    },

    getExpensesByAcademicYear: async (academicYearId) => {
        try {
            const response = await api.get(`/expenses/academic-year/${academicYearId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors du filtrage par année:", error);
            throw error;
        }
    }
};