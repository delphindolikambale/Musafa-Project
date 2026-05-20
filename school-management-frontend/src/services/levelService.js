import axios from "axios";

const API_URL = "http://localhost:8080/api/levels"; 

const getAllLevels = () => {
  return axios.get(API_URL);
};

const createLevel = (levelData) => {
  return axios.post(API_URL, levelData);
};

const updateLevel = (id, levelData) => {
  return axios.put(`${API_URL}/${id}`, levelData);
};

const deleteLevel = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllLevels,
  createLevel,
  updateLevel,
  deleteLevel,
};