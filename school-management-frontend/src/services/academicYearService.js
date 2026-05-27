import api from './api';

const ACADEMIC_URL = "/academic-years";

const academicService = {
    getAllAcademicYears: () => api.get(ACADEMIC_URL),
    
    getActiveYear: () => api.get(`${ACADEMIC_URL}/active`),
    
    createAcademicYear: (data) => api.post(ACADEMIC_URL, data),
    
    updateAcademicYear: (id, data) => api.put(`${ACADEMIC_URL}/${id}`, data),
    
    deleteAcademicYear: (id) => api.delete(`${ACADEMIC_URL}/${id}`),
    
    activateYear: (id) => api.patch(`${ACADEMIC_URL}/${id}/activate`, {})
};

export default academicService;