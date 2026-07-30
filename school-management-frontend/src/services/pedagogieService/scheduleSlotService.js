import api from '../api';

const API_URL = '/v1/schedulesSlot';

const scheduleSlotService = {
  // Ajouter un nouveau créneau
  addSlot: async (slotData) => {
    const response = await api.post(API_URL, slotData);
    return response.data;
  },

  // Modifier un créneau existant
  updateSlot: async (schoolId, slotId, slotData) => {
    const response = await api.put(`${API_URL}/${slotId}`, slotData, {
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  },

  // Récupérer l'emploi du temps d'une classe
  getClassroomSchedule: async (schoolId, classroomId, academicYearId) => {
    const response = await api.get(`${API_URL}/classroom/${classroomId}`, {
      params: { academicYearId },
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  },

  // ✅ AJOUT : Récupérer l'emploi du temps d'un enseignant
  getTeacherSchedule: async (schoolId, teacherId, academicYearId) => {
    const response = await api.get(`${API_URL}/teacher/${teacherId}`, {
      params: { academicYearId },
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  },

  // Supprimer un créneau
  deleteSlot: async (schoolId, slotId) => {
    const response = await api.delete(`${API_URL}/${slotId}`, {
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  }
};

export default scheduleSlotService;