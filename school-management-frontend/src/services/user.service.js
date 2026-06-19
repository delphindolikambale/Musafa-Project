import axios from "axios";
import authHeader from "./auth-header";

// ✅ Détection automatique de l'environnement (Racine de l'API admin)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/admin"
  : "http://localhost:8080/api/admin";

// Récupérer tous les utilisateurs dynamiquement
const getAllUsers = () => {
  return axios.get(`${API_URL}/users`, { headers: authHeader() });
};

// Créer un nouvel utilisateur avec ses informations et son rôle
const createUser = (userData) => {
  // userData contient { username: "...", email: "...", password: "...", roles: ["ROLE_..."] }
  return axios.post(`${API_URL}/users`, userData, { headers: authHeader() });
};

// Mettre à jour l'utilisateur (Rôle, Mot de passe et/ou liaison Enseignant)
const updateUser = (userId, userData) => {
  return axios.put(`${API_URL}/users/${userId}`, userData, { headers: authHeader() });
};

// Supprimer définitivement un utilisateur
const deleteUser = (userId) => {
  return axios.delete(`${API_URL}/users/${userId}`, { headers: authHeader() });
};

const UserService = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default UserService;