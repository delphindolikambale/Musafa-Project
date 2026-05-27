import api from './api';

const getStats = () => {
    // ✅ CORRECTION : Utilisation de l'instance 'api' (qui possède déjà la baseURL et l'intercepteur JWT)
    // Au lieu de axios.get(`${API_URL}/stats`)
    return api.get('/dashboard/stats');
};

export default { getStats };