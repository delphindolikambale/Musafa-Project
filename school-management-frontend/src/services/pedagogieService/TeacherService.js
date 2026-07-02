import api, { BACKEND_BASE } from '../api'; // ✅ MODIFICATION : Import de l'instance centrale et de la base URL

export const API_BASE_URL = BACKEND_BASE;

export const getFileUrl = (path) => {
    if (!path) return null; 
    
    // 1. Nettoyage des antislashs (Windows) en slashs universels
    let cleanPath = path;
    if (typeof cleanPath === 'string') {
        cleanPath = cleanPath.replace(/\\/g, '/');
        
        // 2. CORRECTION CRITIQUE (Mixed Content)
        // Remplace l'URL localhost enregistrée en DB par le BACKEND_BASE dynamique.
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
                'Content-Type': 'multipart/form-data' // ✅ L'intercepteur injecte automatiquement le Bearer Token
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
                'Content-Type': 'multipart/form-data' // ✅ L'intercepteur injecte automatiquement le Bearer Token
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