import axios from "axios";
import { BACKEND_BASE } from "./api"; 

const API_BASE = `${BACKEND_BASE}/api`;

const login = async (username, password) => {
  localStorage.removeItem("user");
  const response = await axios.post(`${API_BASE}/auth/signin`, {
    username,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const register = (username, email, password, schoolId, role = "ELEVE") => {
  return axios.post(`${API_BASE}/auth/signup`, {
    username,
    email,
    password,
    schoolId,
    role,
  });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const activateSchool = async (schoolId, activationCode) => {
  const user = getCurrentUser();
  const token = user?.token || user?.accessToken;

  const response = await axios.post(
    `${API_BASE}/school/activate`,
    { schoolId, activationCode },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
};

const initSuperAdmin = async () => {
  const response = await axios.post(`${API_BASE}/auth/init-superadmin`);
  return response.data;
};

// ✅ AJOUT : Fonction publique pour récupérer les écoles sans Token
const getPublicSchools = async () => {
  const response = await axios.get(`${API_BASE}/system-admin/public/schools`);
  return response.data;
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  activateSchool,
  initSuperAdmin,
  getPublicSchools, // Exportation de la nouvelle fonction
};

export default AuthService;