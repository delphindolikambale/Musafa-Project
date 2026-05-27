import api, { BACKEND_BASE } from './api';

const API_URL = "/archives";
const ENROLLMENT_URL = "/enrollments"; 

const ArchiveService = {
    
    getAllStudentsSummary: async () => {
        try {
            const response = await api.get(`${API_URL}/students/search`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la liste des élèves", error);
            throw error;
        }
    },

    getStudentFolder: async (matricule) => {
        try {
            const response = await api.get(`${API_URL}/student/${matricule}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du dossier complet", error);
            throw error;
        }
    },

    getStudentByMatricule: async (matricule) => {
        return await ArchiveService.getStudentFolder(matricule);
    },

    /**
     * Supprimer un document physiquement et en base de données
     */
    deleteDocument: async (enrollmentId, documentId) => {
        try {
            const response = await api.delete(`${ENROLLMENT_URL}/${enrollmentId}/documents/${documentId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la suppression du document", error);
            throw error;
        }
    },

    uploadDocument: async (enrollmentId, file, type) => {
        const formData = new FormData();
        formData.append('enrollmentId', enrollmentId);
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await api.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de l'upload", error);
            throw error;
        }
    },

    getDocumentUrl: (fileName) => {
        if (!fileName) return null;
        return `${BACKEND_BASE}/api${API_URL}/documents/view/${fileName}`;
    }
};

export default ArchiveService;