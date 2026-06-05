import axios from "axios";
import AuthService from "../auth.service";

const API_URL = "http://localhost:8080/api/student-portal/";

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

const StudentSpaceService = {
  // Lier le compte utilisateur global à un élève physique enregistré
  linkStudentAccount: async (matricule, schoolPassword) => {
    const user = AuthService.getCurrentUser();
    const response = await axios.post(
      `${API_URL}link-account`,
      {
        userId: user.id,
        matricule: matricule,
        schoolPassword: schoolPassword
      },
      { headers: getAuthHeader() }
    );
    
    if (response.data && response.data.isLinked) {
      // Mettre à jour l'utilisateur en cache local avec ses nouvelles informations de liaison
      const updatedUser = { ...user, isLinked: true, matricule: response.data.matricule, studentId: response.data.studentId };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    return response.data;
  },

  // Récupérer le profil complet de l'élève connecté (classe, section, année en cours)
  getStudentProfile: async (studentId, academicYearId) => {
    const response = await axios.get(`${API_URL}profile/${studentId}?yearId=${academicYearId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Récupérer la situation financière de l'élève
  getFinancialSituation: async (studentId, academicYearId) => {
    const response = await axios.get(`${API_URL}finance/${studentId}?yearId=${academicYearId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  }
};

export default StudentSpaceService;