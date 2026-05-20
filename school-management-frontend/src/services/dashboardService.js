import axios from "axios";

const API_URL = "http://localhost:8080/api/dashboard";

const getStats = () => {
    return axios.get(`${API_URL}/stats`);
};

export default { getStats };