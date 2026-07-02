import api from "./api"; // ✅ MODIFICATION : Utilisation de l'instance centralisée avec l'intercepteur JWT

const optionService = {
    getAll: () => api.get("/options"), // ✅ MODIFICATION : Utilisation de l'instance sécurisée avec route relative
    
    // Cette méthode est géniale pour filtrer par section côté interface
    getBySection: (sectionId) => api.get(`/options/section/${sectionId}`),
    
    // Ici data contient { optionName, sectionId, active } pour OptionRequestDTO
    create: (data) => api.post("/options", data),
    update: (id, data) => api.put(`/options/${id}`, data),
    delete: (id) => api.delete(`/options/${id}`)
};

export default optionService;