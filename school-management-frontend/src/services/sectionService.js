import axios from "axios";

const API_URL = "http://localhost:8080/api/sections";

const sectionService = {
    getAll: () => axios.get(API_URL),
    // Le 'data' ici correspond au SectionRequestDTO du Backend
    create: (data) => axios.post(API_URL, data),
    // L'ID est passé en PathVariable comme dans votre Controller
    update: (id, data) => axios.put(`${API_URL}/${id}`, data),
    delete: (id) => axios.delete(`${API_URL}/${id}`)
};

export default sectionService;