import axios from 'axios';

const API_URL = 'http://localhost:8080/api/expenses'; 

export const expenseService = {
    createExpense: async (expenseData) => {
        try {
            const response = await axios.post(API_URL, expenseData);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la dépense:", error);
            throw error;
        }
    },

    getAllExpenses: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des dépenses:", error);
            throw error;
        }
    },

    getExpensesByAcademicYear: async (academicYearId) => {
        try {
            const response = await axios.get(`${API_URL}/academic-year/${academicYearId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors du filtrage par année:", error);
            throw error;
        }
    }
};