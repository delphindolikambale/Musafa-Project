import axios from 'axios';

// Le code vérifie l'adresse dans la barre de recherche du navigateur
const deployeeSurRender = window.location.hostname.includes('onrender.com');

// 🔥 CORRECTION : On déclare et on EXPORTE explicitement BACKEND_BASE pour les autres services
export const BACKEND_BASE = deployeeSurRender 
    ? "https://musafa-projectbackend.onrender.com" 
    : "http://localhost:8080";

const api = axios.create({
    // On utilise la constante ici en ajoutant /api pour Axios
    baseURL: `${BACKEND_BASE}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 🔥 Intercepteur pour injecter automatiquement le Token JWT
api.interceptors.request.use(
    (config) => {
        // On récupère l'utilisateur depuis le localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Si l'utilisateur existe et qu'il a un token, on l'ajoute dans l'en-tête Authorization
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