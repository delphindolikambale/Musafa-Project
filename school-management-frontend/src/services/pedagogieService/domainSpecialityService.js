import axios from 'axios';

const API_URL = "http://localhost:8080/api/specialities";

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const domainSpecialityService = {
    /**
     * Récupère la liste complète des spécialités (ex: MATHÉMATIQUES, PHYSIQUE, BIOLOGIE...)
     */
    getAllSpecialities: async () => {
        const response = await axios.get(API_URL, { headers: getHeader() });
        return response.data;
    },

    /**
     * Récupère le détail d'une spécialité par son ID
     */
    getSpecialityById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: getHeader() });
        return response.data;
    },

    /**
     * Crée une nouvelle spécialité dans le référentiel
     */
    createSpeciality: async (data) => {
        const response = await axios.post(API_URL, data, { headers: getHeader() });
        return response.data;
    },

    /**
     * Supprime une spécialité du référentiel
     */
    deleteSpeciality: async (id) => {
        await axios.delete(`${API_URL}/${id}`, { headers: getHeader() });
    }
};

export default domainSpecialityService;