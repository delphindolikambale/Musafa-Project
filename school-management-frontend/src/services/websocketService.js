import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BACKEND_BASE } from './api'; // ✅ Importation de la base URL dynamique

let stompClient = null;
let isConnected = false;
let isConnecting = false; 
let subscribers = new Set();

export const websocketService = {
    connect: (onMessageReceived) => {
        if (onMessageReceived) subscribers.add(onMessageReceived);

        if (isConnected || isConnecting) return;

        isConnecting = true;
        // ✅ Utilisation de BACKEND_BASE (HTTP en local, HTTPS sur Render)
        const socket = new SockJS(`${BACKEND_BASE}/ws`);
        stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; 

        stompClient.connect({}, (frame) => {
            console.log('✅ WebSocket Connecté (Flux Mixtes)');
            isConnected = true;
            isConnecting = false;
            
            // Canal 1: Inscriptions (Objets JSON)
            stompClient.subscribe('/topic/financial-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            // Canal 2: Tarification (Texte Brut)
            stompClient.subscribe('/topic/finance-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

        }, (error) => {
            console.error('❌ Erreur WebSocket:', error);
            isConnected = false;
            isConnecting = false;
            setTimeout(() => websocketService.connect(), 5000);
        });
    },

    _processMessage: (body) => {
        try {
            // On tente de parser. Si ça marche, on envoie l'objet.
            const data = JSON.parse(body);
            subscribers.forEach(callback => callback(data));
        } catch (e) {
            // Si c'veut pas parser (texte brut), on envoie le string tel quel.
            subscribers.forEach(callback => callback(body));
        }
    },

    disconnect: (callbackToRemove) => {
        if (callbackToRemove) subscribers.delete(callbackToRemove);
        if (subscribers.size === 0 && stompClient && isConnected) {
            stompClient.disconnect(() => console.log("🛑 Déconnecté."));
            stompClient = null;
            isConnected = false;
        }
    }
};