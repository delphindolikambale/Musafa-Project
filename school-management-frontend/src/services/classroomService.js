import api from './api';

export const ClassroomService = {
    // Récupère toutes les classes avec filtrage par année pour les compteurs d'élèves
    getAll: (academicYearId = null) => {
        const url = academicYearId ? `/classrooms?academicYearId=${academicYearId}` : '/classrooms';
        return api.get(url);
    },
    
    // Création d'une nouvelle classe pédagogique
    create: (classroomData) => api.post('/classrooms', classroomData),
    
    // Mise à jour complète
    updateClassroom: (id, classroomData) => api.put(`/classrooms/${id}`, classroomData),
    
    // Alias de mise à jour pour la compatibilité
    update: (id, data) => api.put(`/classrooms/${id}`, data),
    
    // Récupération filtrée par niveau scolaire avec année
    getByLevel: (levelId, academicYearId = null) => {
        const url = academicYearId 
            ? `/classrooms/level/${levelId}?academicYearId=${academicYearId}` 
            : `/classrooms/level/${levelId}`;
        return api.get(url);
    },
    
    // Activation / Désactivation
    toggleStatus: (id) => api.patch(`/classrooms/${id}/toggle`),
    
    // Suppression définitive
    delete: (id) => api.delete(`/classrooms/${id}`)
};