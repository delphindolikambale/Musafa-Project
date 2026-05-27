import axios from 'axios';

// Le code vérifie l'adresse dans la barre de recherche du navigateur
const deployeeSurRender = window.location.hostname.includes('onrender.com');

// EXPORT EXPLICITE pour corriger l'erreur de build sur Rollup/Vite
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

// Intercepteur pour injecter automatiquement le Token JWT
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user && user.accessToken) {
            config.headers['Authorization'] = 'Bearer ' + user.accessToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;