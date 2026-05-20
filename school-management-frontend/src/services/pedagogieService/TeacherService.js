import axios from 'axios';

export const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/teachers`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

export const getFileUrl = (path) => {
    if (!path) return null; 
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const resourceEndpoint = `${API_BASE_URL}/api/resources/view`;
    const timestamp = new Date().getTime();
    return `${resourceEndpoint}?path=${encodeURIComponent(path)}&t=${timestamp}`;
};

const TeacherService = {
    getAllTeachers: async () => {
        const response = await axios.get(API_URL, { headers: getHeader() });
        return response.data;
    },

    // Nouveau : Récupérer uniquement les enseignants actifs
    getActiveTeachers: async () => {
        const response = await axios.get(`${API_URL}/active`, { headers: getHeader() });
        return response.data;
    },

    searchTeachers: async (query) => {
        const response = await axios.get(`${API_URL}/search`, { 
            params: { query },
            headers: getHeader() 
        });
        return response.data;
    },

    createTeacher: async (formData) => {
        const response = await axios.post(API_URL, formData, {
            headers: { 
                ...getHeader(),
                'Content-Type': 'multipart/form-data' 
            }
        });
        return response.data;
    },

    getTeacherById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: getHeader() });
        return response.data;
    },

    updateTeacher: async (id, formData) => {
        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: { 
                ...getHeader(),
                'Content-Type': 'multipart/form-data' 
            }
        });
        return response.data;
    },

    // Nouveau : Changer l'état actif/inactif
    toggleActiveStatus: async (id) => {
        const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, { headers: getHeader() });
        return response.data;
    },

    deleteTeacher: async (id) => {
        await axios.delete(`${API_URL}/${id}`, { headers: getHeader() });
    }
};

export default TeacherService;