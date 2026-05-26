import axios from "axios";

// ✅ Détection automatique de l'environnement (Render ou Localhost)
const API_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/options"
  : "http://localhost:8080/api/options";

const optionService = {
    getAll: () => axios.get(API_URL),
    // Cette méthode est géniale pour filtrer par section côté interface
    getBySection: (sectionId) => axios.get(`${API_URL}/section/${sectionId}`),
    // Ici data contient { optionName, sectionId, active } pour OptionRequestDTO
    create: (data) => axios.post(API_URL, data),
    update: (id, data) => axios.put(`${API_URL}/${id}`, data),
    delete: (id) => axios.delete(`${API_URL}/${id}`)
};

export default optionService;