import api, { BACKEND_BASE } from '../api';

export const API_BASE_URL = BACKEND_BASE;

export const PEDAGOGICAL_DAYS_OPTIONS = [
    { value: 'LUNDI', label: 'Lundi' },
    { value: 'MARDI', label: 'Mardi' },
    { value: 'MERCREDI', label: 'Mercredi' },
    { value: 'JEUDI', label: 'Jeudi' },
    { value: 'VENDREDI', label: 'Vendredi' },
    { value: 'SAMEDI', label: 'Samedi' }
];

export const getFileUrl = (path) => {
    if (!path) return null; 
    
    let cleanPath = path;
    if (typeof cleanPath === 'string') {
        cleanPath = cleanPath.replace(/\\/g, '/');
        if (cleanPath.includes('http://localhost:8080')) {
            cleanPath = cleanPath.replace('http://localhost:8080', BACKEND_BASE);
        }
    }

    if (typeof cleanPath === 'string' && (cleanPath.startsWith('http') || cleanPath.startsWith('data:'))) {
        const separator = cleanPath.includes('?') ? '&' : '?';
        return `${cleanPath}${separator}t=${new Date().getTime()}`;
    }
    
    const resourceEndpoint = `${BACKEND_BASE}/api/resources/view`;
    const timestamp = new Date().getTime();
    return `${resourceEndpoint}?path=${encodeURIComponent(cleanPath)}&t=${timestamp}`;
};

const TeacherService = {
    getAllTeachers: async () => {
        const response = await api.get('/teachers');
        return response.data;
    },

    getActiveTeachers: async () => {
        const response = await api.get('/teachers/active');
        return response.data;
    },

    searchTeachers: async (query) => {
        const response = await api.get('/teachers/search', { 
            params: { query }
        });
        return response.data;
    },

    createTeacher: async (formData) => {
        const response = await api.post('/teachers', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getTeacherById: async (id) => {
        const response = await api.get(`/teachers/${id}`);
        return response.data;
    },

    updateTeacher: async (id, formData) => {
        const response = await api.put(`/teachers/${id}`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    toggleActiveStatus: async (id) => {
        const response = await api.patch(`/teachers/${id}/toggle-status`, {});
        return response.data;
    },

    deleteTeacher: async (id) => {
        await api.delete(`/teachers/${id}`);
    }
};

export default TeacherService;