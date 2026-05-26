import axios from "axios";

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/levels"
  : "http://localhost:8080/api/levels";

const getAllLevels = () => {
  return axios.get(API_URL);
};

const createLevel = (levelData) => {
  return axios.post(API_URL, levelData);
};

const updateLevel = (id, levelData) => {
  return axios.put(`${API_URL}/${id}`, levelData);
};

const deleteLevel = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllLevels,
  createLevel,
  updateLevel,
  deleteLevel,
};