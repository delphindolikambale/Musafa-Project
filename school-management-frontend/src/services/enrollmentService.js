import axios from 'axios';

const API_URL = "http://localhost:8080/api/enrollments";
const ACADEMIC_URL = "http://localhost:8080/api/academic-years";
const BACKEND_BASE = "http://localhost:8080";

export const enrollmentService = {
    
    getActiveYear: async () => {
        const res = await axios.get(`${ACADEMIC_URL}/active`);
        return res.data;
    },

    getAllEnrollments: async (academicYearId = null) => {
        const url = academicYearId ? `${API_URL}?yearId=${academicYearId}` : API_URL;
        const res = await axios.get(url);
        return res.data;
    },

    // C'est cette méthode qui déclenche la création financière et la notification côté Backend
    createEnrollment: async (formData) => {
        const res = await axios.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    updateEnrollment: async (id, formData) => {
        const res = await axios.put(`${API_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    deleteEnrollment: async (id) => {
        const res = await axios.delete(`${API_URL}/${id}`);
        return res.status;
    },

    getEnrollmentReport: async (classroomId, academicYearId) => {
        const res = await axios.get(`${API_URL}/report/classroom/${classroomId}/academic-year/${academicYearId}`);
        return res.data;
    },

    viewDocumentSecurely: async (fileUrl) => {
        try {
            const token = localStorage.getItem('token');
            if (!fileUrl) {
                alert("Le chemin du fichier est introuvable.");
                return;
            }

            let finalUrl = fileUrl;
            if (fileUrl.includes("localhost:5173") || !fileUrl.startsWith('http')) {
                const path = fileUrl.includes("localhost:5173") 
                    ? fileUrl.split("localhost:5173")[1] 
                    : fileUrl;
                finalUrl = `${BACKEND_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
            }

            const response = await fetch(finalUrl, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                }
            });
            
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            console.error("Erreur visualisation:", error);
            alert(`Impossible d'ouvrir le document : ${error.message}`);
        }
    }
};

export default enrollmentService;