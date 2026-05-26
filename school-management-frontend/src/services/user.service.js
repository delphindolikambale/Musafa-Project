import axios from "axios";
import authHeader from "./auth-header";

// ✅ Détection automatique : URL Render en production, localhost en développement
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/admin/users"
  : "http://localhost:8080/api/admin/users";

// Récupérer tous les utilisateurs dynamiquement
const getAllUsers = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

// Mettre à jour l'utilisateur (Rôle et/ou Mot de passe)
const updateUser = (userId, userData) => {
  // userData peut contenir { roles: ["ROLE_..."], password: "..." }
  return axios.put(`${API_URL}/${userId}`, userData, { headers: authHeader() });
};

const UserService = {
  getAllUsers,
  updateUser,
};

export default UserService;