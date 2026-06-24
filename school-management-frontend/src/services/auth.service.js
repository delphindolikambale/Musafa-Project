import axios from "axios";
import { BACKEND_BASE } from "./api"; // Importation de l'URL correcte depuis api.js

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

const register = (username, email, password, role = "ELEVE") => {
  return axios.post(`${API_BASE}/auth/signup`, {
    username,
    email,
    password,
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

// ✅ ADAPTATION : Ajout de la méthode d'initialisation automatique pour réparer le compte superadmin directement via le cycle de vie de l'application
const initSuperAdmin = async () => {
  const response = await axios.post(`${API_BASE}/auth/init-superadmin`);
  return response.data;
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  activateSchool,
  initSuperAdmin, // Exportation de la méthode de secours
};

export default AuthService;