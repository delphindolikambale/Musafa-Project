import api from '../api';

const API_URL = '/v1/hour-slots';

const hourSlotService = {
  // Créer une nouvelle tranche horaire
  addHourSlot: async (slotData) => {
    const response = await api.post(API_URL, slotData);
    return response.data;
  },

  // Récupérer les tranches horaires d'une école
  getSchoolHourSlots: async (schoolId) => {
    const response = await api.get(API_URL, {
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  },

  // Modifier une tranche horaire
  updateHourSlot: async (schoolId, id, slotData) => {
    const response = await api.put(`${API_URL}/${id}`, slotData, {
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  },

  // Supprimer une tranche horaire
  deleteHourSlot: async (schoolId, id) => {
    const response = await api.delete(`${API_URL}/${id}`, {
      headers: { 'X-School-Id': schoolId }
    });
    return response.data;
  }
};

export default hourSlotService;