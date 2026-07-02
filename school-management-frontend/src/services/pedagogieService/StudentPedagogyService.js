import api from "../api"; // ✅ Ajustement du chemin pour cibler src/services/api.js

const StudentPedagogyService = {
  // Résultats & Bulletin
  getResults: (type) => api.get(`/student/pedagogy/results?type=${type}`), // type: 'periode'|'semestre'|'annuel'
  
  // Horaires
  getCourseSchedule: () => api.get("/student/pedagogy/schedule/courses"),
  getExamSchedule: () => api.get("/student/pedagogy/schedule/exams"),
  
  // Ressources & Suivi
  getCourseNotes: () => api.get("/student/pedagogy/course-notes"),
  getAttendance: () => api.get("/student/pedagogy/attendance"),
  
  // Travaux Pratiques (TP)
  getAssignments: () => api.get("/student/pedagogy/assignments"),
  submitAssignment: (assignmentId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/student/pedagogy/assignments/${assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};

export default StudentPedagogyService;