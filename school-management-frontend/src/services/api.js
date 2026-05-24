import axios from 'axios';

// Si le navigateur est sur onrender.com, on utilise le backend en production, sinon localhost
const backendUrl = window.location.hostname.includes('onrender.com')
    ? 'https://musafa-projectbackend.onrender.com/api'
    : 'http://localhost:8080/api';

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;