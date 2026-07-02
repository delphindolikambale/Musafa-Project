import api from "./api"; // ✅ MODIFICATION : Importation de votre instance configurée avec l'intercepteur JWT

const getAllLevels = () => {
    return api.get("/levels"); // ✅ MODIFICATION : Utilisation de l'instance sécurisée avec la route relative
};

const createLevel = (levelData) => {
    return api.post("/levels", levelData);
};

const updateLevel = (id, levelData) => {
    return api.put(`/levels/${id}`, levelData);
};

const deleteLevel = (id) => {
    return api.delete(`/levels/${id}`);
};

export default {
    getAllLevels,
    createLevel,
    updateLevel,
    deleteLevel,
};