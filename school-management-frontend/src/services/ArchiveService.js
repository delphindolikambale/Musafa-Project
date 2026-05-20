import axios from 'axios';

const API_URL = "http://localhost:8080/api/archives";
const ENROLLMENT_URL = "http://localhost:8080/api/enrollments"; 

const ArchiveService = {
    
    getAllStudentsSummary: async () => {
        try {
            const response = await axios.get(`${API_URL}/students/search`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la liste des élèves", error);
            throw error;
        }
    },

    getStudentFolder: async (matricule) => {
        try {
            const response = await axios.get(`${API_URL}/student/${matricule}`);
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
     * ✅ Supprimer un document physiquement et en base de données
     * Utilise maintenant le documentId dans l'URL pour correspondre au Backend
     */
    deleteDocument: async (enrollmentId, documentId) => {
        try {
            // L'URL générée sera : /api/enrollments/{enrollmentId}/documents/{documentId}
            const response = await axios.delete(`${ENROLLMENT_URL}/${enrollmentId}/documents/${documentId}`);
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
            const response = await axios.post(`${API_URL}/upload`, formData, {
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
        return `${API_URL}/documents/view/${fileName}`;
    }
};

export default ArchiveService;