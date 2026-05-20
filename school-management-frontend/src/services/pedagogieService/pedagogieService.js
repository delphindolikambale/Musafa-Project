import axios from 'axios';

const API_URL = "http://localhost:8080/api/pedagogie";

const pedagogieService = {
  // Enseignants
  getTeachers: () => axios.get(`${API_URL}/teachers`),
  addTeacher: (data) => axios.post(`${API_URL}/teachers`, data),
  
  // Cours
  getCourses: () => axios.get(`${API_URL}/courses`),
  assignTeacherToCourse: (data) => axios.post(`${API_URL}/assignments`, data),
  
  // Horaires
  getSchedule: (classId) => axios.get(`${API_URL}/schedule/${classId}`),
  saveSchedule: (schedule) => axios.post(`${API_URL}/schedule`, schedule),
  
  // Présences
  getTeacherAttendance: () => axios.get(`${API_URL}/attendance`),
  markTeacherAttendance: (scanData) => axios.post(`${API_URL}/attendance/scan`, scanData)
};

export default pedagogieService;