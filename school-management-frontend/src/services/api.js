import axios from 'axios';

const deployeeSurRender = window.location.hostname.includes('onrender.com');

export const BACKEND_BASE = deployeeSurRender 
    ? "https://musafa-projectbackend.onrender.com" 
    : "http://localhost:8080";

export const getImageUrl = (path) => {
    if (!path) return '';
    return `${BACKEND_BASE}/${path.replace(/^\/+/, '')}`;
};

const api = axios.create({
    baseURL: `${BACKEND_BASE}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        let token = null;

        // 1. Tenter d'extraire le jeton depuis l'objet 'user'
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                token = user?.token || user?.accessToken || user?.jwt;
            } catch (e) {
                // Si 'user' dans localStorage était directement le jeton texte brut
                token = userStr;
            }
        }

        // 2. Recherche de secours si le token est stocké sous d'autres clés classiques
        if (!token) {
            token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('jwt');
        }

        // 3. Injecter l'en-tête Authorization s'il existe
        if (token) {
            // Nettoyage des guillemets si présent
            const cleanToken = String(token).replace(/^"(.*)"$/, '$1').trim();
            config.headers['Authorization'] = `Bearer ${cleanToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;