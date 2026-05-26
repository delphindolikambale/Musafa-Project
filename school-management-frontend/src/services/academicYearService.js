import axios from "axios";

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/academic-years"
  : "http://localhost:8080/api/academic-years";

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const academicService = {
    getAllAcademicYears: () => axios.get(API_URL, { headers: getHeader() }),
    
    getActiveYear: () => axios.get(`${API_URL}/active`, { headers: getHeader() }),
    
    createAcademicYear: (data) => axios.post(API_URL, data, { headers: getHeader() }),
    
    updateAcademicYear: (id, data) => axios.put(`${API_URL}/${id}`, data, { headers: getHeader() }),
    
    deleteAcademicYear: (id) => axios.delete(`${API_URL}/${id}`, { headers: getHeader() }),
    
    activateYear: (id) => axios.patch(`${API_URL}/${id}/activate`, {}, { headers: getHeader() })
};

export default academicService;