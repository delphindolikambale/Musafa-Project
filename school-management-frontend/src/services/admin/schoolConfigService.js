import axios from 'axios';

// ✅ Détection automatique et robuste de l'environnement (Render ou Localhost)
const API_BASE_URL = window.location.hostname.includes('onrender.com')
  ? "https://musafa-projectbackend.onrender.com/api/v1/admin/school-config"
  : "http://localhost:8080/api/v1/admin/school-config";

const getSchoolConfig = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
};

// Utilise POST pour la création initiale
const createSchoolConfig = async (configData) => {
    const response = await axios.post(API_BASE_URL, configData);
    return response.data;
};

// Utilise PUT pour la mise à jour professionnelle
const updateSchoolConfig = async (configData) => {
    const response = await axios.put(API_BASE_URL, configData);
    return response.data;
};

// Pour réinitialiser si besoin
const deleteSchoolConfig = async () => {
    const response = await axios.delete(API_BASE_URL);
    return response.data;
};

export default { getSchoolConfig, createSchoolConfig, updateSchoolConfig, deleteSchoolConfig };