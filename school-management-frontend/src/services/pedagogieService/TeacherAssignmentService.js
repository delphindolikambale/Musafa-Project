import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/teacher-assignments`;

const getHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.accessToken ? { Authorization: 'Bearer ' + user.accessToken } : {};
};

const TeacherAssignmentService = {
    assignTeacher: async (dto) => {
        const response = await axios.post(API_URL, dto, { headers: getHeader() });
        return response.data;
    },
    updateAssignment: async (id, dto) => {
        const response = await axios.put(`${API_URL}/${id}`, dto, { headers: getHeader() });
        return response.data;
    },
    getAssignmentsByClass: async (classroomId, yearId) => {
        const response = await axios.get(`${API_URL}/class/${classroomId}/${yearId}`, { headers: getHeader() });
        return response.data;
    },
    getAssignmentsByTeacher: async (teacherId, yearId) => {
        const response = await axios.get(`${API_URL}/teacher/${teacherId}/${yearId}`, { headers: getHeader() });
        return response.data;
    },
    deleteAssignment: async (id) => {
        await axios.delete(`${API_URL}/${id}`, { headers: getHeader() });
    },
    // Nouvelle fonction pour l'importation
    importPreviousYear: async (sourceYearId, targetYearId) => {
        const response = await axios.post(`${API_URL}/import-previous-year`, {
            sourceYearId,
            targetYearId
        }, { headers: getHeader() });
        return response.data;
    }
};

export default TeacherAssignmentService;