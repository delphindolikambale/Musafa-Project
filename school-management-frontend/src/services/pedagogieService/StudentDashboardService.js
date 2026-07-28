import api from "../api";

const getDashboardData = async (schoolId, academicYearId) => {
  const response = await api.get('/v1/student/dashboard', {
    headers: {
      "X-School-Id": schoolId,
    },
    params: {
      academicYearId: academicYearId,
    }
  });
  return response.data;
};

export const studentDashboardService = {
  getDashboardData,
};