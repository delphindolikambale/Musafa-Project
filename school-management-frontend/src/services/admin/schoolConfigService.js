import axios from 'axios';

const API_URL = "http://localhost:8080/api/v1/admin/school-config";

const getSchoolConfig = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Utilise POST pour la création initiale
const createSchoolConfig = async (configData) => {
    const response = await axios.post(API_URL, configData);
    return response.data;
};

// Utilise PUT pour la mise à jour (plus professionnel)
const updateSchoolConfig = async (configData) => {
    const response = await axios.put(API_URL, configData);
    return response.data;
};

// Pour réinitialiser si besoin
const deleteSchoolConfig = async () => {
    const response = await axios.delete(API_URL);
    return response.data;
};

export default { getSchoolConfig, createSchoolConfig, updateSchoolConfig, deleteSchoolConfig };