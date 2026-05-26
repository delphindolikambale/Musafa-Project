import axios from 'axios';

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/v1/admin/school-config"
  : "http://localhost:8080/api/v1/admin/school-config";

export const SchoolConfigService = {
  /**
   * Récupère la configuration globale de l'école (Nom, Logo, etc.)
   */
  getConfig: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration de l'école:", error);
      throw error;
    }
  }
};

export default SchoolConfigService;