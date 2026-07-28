import axios from 'axios';

// ✅ CORRECTION CRITIQUE : Ajout de l'URL de base du backend. 
// Remplacez 'http://localhost:8080' par le port exact sur lequel tourne votre Spring Boot.
// Si vous utilisez un fichier .env, vous pouvez utiliser : const BASE_URL = process.env.REACT_APP_API_URL;
const BASE_URL = 'http://localhost:8080'; 
const API_URL = `${BASE_URL}/api/pedagogy/dashboard`;

const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token || localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    console.warn("Impossible de lire le token depuis le cache local.");
  }
  return {};
};

const getPedagogyStats = () => {
  return axios.get(`${API_URL}/stats`, { headers: getAuthHeader() });
};

const pedagogieDashboardService = {
  getPedagogyStats,
};

export default pedagogieDashboardService;