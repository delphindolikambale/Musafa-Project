import api from './api';

export const RoomService = {
    getAll: () => api.get('/rooms'),
    getActive: () => api.get('/rooms/active'),
    getAvailable: (params = '') => api.get(`/rooms/available${params}`),
    create: (data) => api.post('/rooms', data),
    getById: (id) => api.get(`/rooms/${id}`),
    update: (id, data) => api.put(`/rooms/${id}`, data),
    
    // ✅ On s'assure que l'ID est bien passé à l'URL
    toggleStatus: (id) => api.patch(`/rooms/${id}/toggle-status`),
    
    delete: (id) => api.delete(`/rooms/${id}`)
};