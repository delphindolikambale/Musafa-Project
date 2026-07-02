import api from './api'; // ✅ MODIFICATION : Utilise l'instance centrale pour inclure dynamiquement la sécurité JWT et l'URL

export const SchoolConfigService = {
  /**
   * Récupère la configuration globale de l'école (Nom, Logo, etc.)
   */
  getConfig: async () => {
    try {
      const response = await api.get("/v1/admin/school-config");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration de l'école:", error);
      throw error;
    }
  }
};

export default SchoolConfigService;