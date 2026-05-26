import axios from 'axios';

// Le code vérifie l'adresse dans la barre de recherche du navigateur
const deployeeSurRender = window.location.hostname.includes('onrender.com');

const api = axios.create({
    // Si on est sur Render, on tape le vrai backend, sinon on reste sur localhost
    baseURL: deployeeSurRender 
        ? "https://musafa-projectbackend.onrender.com/api" 
        : "http://localhost:8080/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 🔥 CORRECTION : Intercepteur pour injecter automatiquement le Token JWT
api.interceptors.request.use(
    (config) => {
        // On récupère l'utilisateur depuis le localStorage (exactement comme vous le faites dans vos services)
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