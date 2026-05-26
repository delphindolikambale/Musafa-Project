import axios from "axios";

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/dashboard"
  : "http://localhost:8080/api/dashboard";

const getStats = () => {
    return axios.get(`${API_URL}/stats`);
};

export default { getStats };