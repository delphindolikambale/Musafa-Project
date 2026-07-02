import api from "../api"; // ✅ Ajustement du chemin pour cibler src/services/api.js

const pedagogieService = {
  // Enseignants
  getTeachers: () => api.get("/pedagogie/teachers"),
  addTeacher: (data) => api.post("/pedagogie/teachers", data),
  
  // Cours
  getCourses: () => api.get("/pedagogie/courses"),
  assignTeacherToCourse: (data) => api.post("/pedagogie/assignments", data),
  
  // Horaires
  getSchedule: (classId) => api.get(`/pedagogie/schedule/${classId}`),
  saveSchedule: (schedule) => api.post("/pedagogie/schedule", schedule),
  
  // Présences
  getTeacherAttendance: () => api.get("/pedagogie/attendance"),
  markTeacherAttendance: (scanData) => api.post("/pedagogie/attendance/scan", scanData)
};

export default pedagogieService;