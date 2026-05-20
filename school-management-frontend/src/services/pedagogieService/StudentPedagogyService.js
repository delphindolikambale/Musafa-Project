import axios from "axios";
import AuthService from "./auth.service";

const API_URL = "http://localhost:8080/api/student/pedagogy/";

const authHeader = () => {
  const user = AuthService.getCurrentUser();
  return (user && user.token) ? { Authorization: `Bearer ${user.token}` } : {};
};

const StudentPedagogyService = {
  // Résultats & Bulletin
  getResults: (type) => axios.get(`${API_URL}results?type=${type}`, { headers: authHeader() }), // type: 'periode'|'semestre'|'annuel'
  
  // Horaires
  getCourseSchedule: () => axios.get(`${API_URL}schedule/courses`, { headers: authHeader() }),
  getExamSchedule: () => axios.get(`${API_URL}schedule/exams`, { headers: authHeader() }),
  
  // Ressources & Suivi
  getCourseNotes: () => axios.get(`${API_URL}course-notes`, { headers: authHeader() }),
  getAttendance: () => axios.get(`${API_URL}attendance`, { headers: authHeader() }),
  
  // Travaux Pratiques (TP)
  getAssignments: () => axios.get(`${API_URL}assignments`, { headers: authHeader() }),
  submitAssignment: (assignmentId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${API_URL}assignments/${assignmentId}/submit`, formData, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
    });
  }
};

export default StudentPedagogyService;