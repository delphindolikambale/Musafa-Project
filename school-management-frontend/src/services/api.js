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

export default api;