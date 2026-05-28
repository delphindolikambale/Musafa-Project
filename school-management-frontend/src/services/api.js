import axios from 'axios';

const deployeeSurRender = window.location.hostname.includes('onrender.com');

export const BACKEND_BASE = deployeeSurRender 
    ? "https://musafa-projectbackend.onrender.com" 
    : "http://localhost:8080";

const api = axios.create({
    baseURL: `${BACKEND_BASE}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const token = user?.token || user?.accessToken || user?.jwt;
                
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
            } catch (e) {
                console.error("Erreur parsing localStorage user", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;