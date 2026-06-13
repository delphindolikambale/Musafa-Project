import api from '../api';

const MyStudentFinanceService = {
    /**
     * Récupère la situation financière actuelle de l'étudiant connecté
     * ainsi que son historique complet de paiement.
     */
    getMyCurrentFinancialStatus: async () => {
        const response = await api.get('/student/finance/status');
        return response.data;
    }
};

export default MyStudentFinanceService;