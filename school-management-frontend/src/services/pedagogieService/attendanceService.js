import axios from 'axios';

const API_BASE_URL = '/api/v1/attendances';

export const attendanceService = {
  /**
   * Enregistre un lot de présences (Matin ou Soir)
   * @param {Object} batchData
   */
  recordDailyAttendance: async (batchData) => {
    const response = await axios.post(`${API_BASE_URL}/record`, batchData);
    return response.data;
  },

  /**
   * Récupère l'état des présences pour une date donnée
   */
  getDailyAttendance: async (schoolId, classroomId, academicYearId, date) => {
    const response = await axios.get(`${API_BASE_URL}/daily`, {
      headers: {
        'X-School-Id': schoolId
      },
      params: {
        classroomId,
        academicYearId,
        date
      }
    });
    return response.data;
  },

  /**
   * Récupère la grille officielle du registre mensuel
   */
  getMonthlyRegister: async (schoolId, classroomId, academicYearId, year, month) => {
    const response = await axios.get(`${API_BASE_URL}/monthly-register`, {
      headers: {
        'X-School-Id': schoolId
      },
      params: {
        classroomId,
        academicYearId,
        year,
        month
      }
    });
    return response.data;
  }
};

export default attendanceService;