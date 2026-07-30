import api from '../api';

/**
 * Service gérant les requêtes du tableau de bord pédagogique.
 * Raccordé à l'instance centralisée 'api' (api.js) pour bénéficier de :
 * 1. La bascule automatique d'URL (Render en prod / localhost en dev).
 * 2. L'injection automatique du token JWT Bearer dans chaque requête.
 */
const getPedagogyStats = () => {
  return api.get('/pedagogy/dashboard/stats');
};

const pedagogieDashboardService = {
  getPedagogyStats,
};

export default pedagogieDashboardService;