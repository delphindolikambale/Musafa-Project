import api from "./api"; // ✅ MODIFICATION : Utilisation de l'instance centralisée avec l'intercepteur JWT

const sectionService = {
    getAll: () => api.get("/sections"), // ✅ MODIFICATION : Utilisation de l'instance sécurisée avec route relative
    
    // Le 'data' ici correspond au SectionRequestDTO du Backend
    create: (data) => api.post("/sections", data),
    
    // L'ID est passé en PathVariable comme dans votre Controller
    update: (id, data) => api.put(`/sections/${id}`, data),
    delete: (id) => api.delete(`/sections/${id}`)
};

export default sectionService;