import axios from 'axios';
import { BACKEND_BASE } from '../api';

export const API_BASE_URL = BACKEND_BASE;
const API_URL = `${API_BASE_URL}/api/teachers`;

const getHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    try {
        const user = JSON.parse(userStr);
        const token = user?.accessToken || user?.token;
        return token ? { Authorization: 'Bearer ' + token } : {};
    } catch (e) {
        return {};
    }
};

export const getFileUrl = (path) => {
    if (!path) return null; 
    
    // 1. Nettoyage des antislashs (Windows) en slashs universels
    let cleanPath = path;
    if (typeof cleanPath === 'string') {
        cleanPath = cleanPath.replace(/\\/g, '/');
        
        // 2. CORRECTION CRITIQUE (Mixed Content)
        // Remplace l'URL localhost enregistrée en DB par le BACKEND_BASE dynamique.
        // En local, BACKEND_BASE = localhost, donc pas de problème.
        // Sur Render, BACKEND_BASE = ton URL https, réglant l'erreur Mixed Content.
        if (cleanPath.includes('http://localhost:8080')) {
            cleanPath = cleanPath.replace('http://localhost:8080', BACKEND_BASE);
        }
    }

    // 3. Si le chemin est déjà une URL absolue valide ou du base64
    if (typeof cleanPath === 'string' && (cleanPath.startsWith('http') || cleanPath.startsWith('data:'))) {
        const separator = cleanPath.includes('?') ? '&' : '?';
        return `${cleanPath}${separator}t=${new Date().getTime()}`;
    }
    
    // 4. Construction dynamique pour les chemins relatifs
    const resourceEndpoint = `${BACKEND_BASE}/api/resources/view`;
    const timestamp = new Date().getTime();
    return `${resourceEndpoint}?path=${encodeURIComponent(cleanPath)}&t=${timestamp}`;
};

const TeacherService = {
    getAllTeachers: async () => {
        const response = await axios.get(API_URL, { headers: getHeader() });
        return response.data;
    },

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

    toggleActiveStatus: async (id) => {
        const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, { headers: getHeader() });
        return response.data;
    },

    deleteTeacher: async (id) => {
        await axios.delete(`${API_URL}/${id}`, { headers: getHeader() });
    }
};

export default TeacherService;