import axios from "axios";

// ✅ Détection automatique : On utilise l'URL Render en production, sinon on reste sur localhost
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/auth/"
  : "http://localhost:8080/api/auth/";

const login = async (username, password) => {
  localStorage.removeItem("user");
  const response = await axios.post(API_URL + "signin", {
    username,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const register = (username, email, password, role = "ELEVE") => {
  return axios.post(API_URL + "signup", {
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
  return JSON.parse(localStorage.getItem("user"));
};

// ✅ Méthode d'activation de la licence d'un établissement pour l'administrateur système
const activateSchool = async (schoolId, activationCode) => {
  const user = getCurrentUser();
  const token = user?.token;

  // Adaptation dynamique de l'URL pour cibler le contrôleur d'établissement
  const response = await axios.post(
    API_URL.replace("/auth/", "/school/") + "activate",
    { schoolId, activationCode },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  activateSchool,
};

export default AuthService;