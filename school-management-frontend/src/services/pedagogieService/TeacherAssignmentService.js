import api from '../api'; // ✅ MODIFICATION : Utilisation de l'instance centralisée

const TeacherAssignmentService = {
    assignTeacher: async (dto) => {
        const response = await api.post('/teacher-assignments', dto);
        return response.data;
    },
    updateAssignment: async (id, dto) => {
        const response = await api.put(`/teacher-assignments/${id}`, dto);
        return response.data;
    },
    getAssignmentsByClass: async (classroomId, yearId) => {
        const response = await api.get(`/teacher-assignments/class/${classroomId}/${yearId}`);
        return response.data;
    },
    getAssignmentsByTeacher: async (teacherId, yearId) => {
        const response = await api.get(`/teacher-assignments/teacher/${teacherId}/${yearId}`);
        return response.data;
    },
    getAssignmentById: async (id) => {
        const response = await api.get(`/teacher-assignments/${id}`);
        return response.data;
    },
    deleteAssignment: async (id) => {
        await api.delete(`/teacher-assignments/${id}`);
    },
    importPreviousYear: async (sourceYearId, targetYearId) => {
        const response = await api.post('/teacher-assignments/import-previous-year', {
            sourceYearId,
            targetYearId
        });
        return response.data;
    },
    
    // --- NOUVEAUX ENDPOINTS POUR LE TABLEAU DE BORD ---
    
    getCourseSuccessRate: async (assignmentId) => {
        const response = await api.get(`/teacher-assignments/success-rate/${assignmentId}`);
        return response.data;
    }
};

export default TeacherAssignmentService;