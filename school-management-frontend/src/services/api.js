import axios from 'axios';
import AuthService from './auth.service';

const deployeeSurRender = window.location.hostname.includes('onrender.com');

export const BACKEND_BASE = deployeeSurRender 
    ? "https://musafa-projectbackend.onrender.com" 
    : "http://localhost:8080";

const api = axios.create({
    baseURL: `${BACKEND_BASE}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        // ✅ CORRECTION : Extraction plus robuste du Token
        // 1. On vérifie d'abord si le token est stocké directement
        let token = localStorage.getItem('token'); 

        // 2. Sinon, on va le chercher dans l'objet 'user'
        if (!token) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    token = user?.token || user?.accessToken || user?.jwt;
                } catch (e) {
                    console.error("Erreur parsing localStorage user", e);
                }
            }
        }

        // 3. Si on a trouvé un token, on l'injecte
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;