import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BACKEND_BASE } from './api';

let stompClient = null;
let isConnected = false;
let isConnecting = false; 
let subscribers = new Set();
let reconnectTimeout = null;
let currentReconnectDelay = 2000; // ✅ Délai initial de reconnexion (2 secondes)

export const websocketService = {
    connect: (onMessageReceived) => {
        // Ajout du callback à la liste des abonnés s'il est fourni
        if (onMessageReceived) {
            subscribers.add(onMessageReceived);
        }

        // Si le canal est déjà ouvert ou en cours d'établissement, on ne fait rien
        if (isConnected || isConnecting) {
            return;
        }

        isConnecting = true;
        
        // Initialisation de la connexion via SockJS
        const socket = new SockJS(`${BACKEND_BASE}/ws`);
        stompClient = Stomp.over(socket);
        
        // Masque les logs de débogage internes STOMP dans la console du navigateur
        stompClient.debug = () => {}; 

        // ✅ Battements de cœur bidirectionnels calés sur 10 secondes.
        // Émet un ping toutes les 10s et s'attend à recevoir un ping du serveur toutes les 10s.
        stompClient.heartbeat.outgoing = 10000; 
        stompClient.heartbeat.incoming = 10000; 

        stompClient.connect({}, (frame) => {
            console.log('✅ WebSocket Connecté avec succès (Flux Mixtes)');
            isConnected = true;
            isConnecting = false;
            currentReconnectDelay = 2000; // ✅ Réinitialisation du délai suite à une connexion réussie
            
            // Annulation de tout plan de reconnexion en attente
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            // Canal 1: Notifications Financières d'Inscriptions (Objets JSON)
            stompClient.subscribe('/topic/financial-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            // Canal 2: Notifications de Tarification Générale (Texte Brut)
            stompClient.subscribe('/topic/finance-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

        }, (error) => {
            console.warn('⚠️ Connexion WebSocket interrompue ou serveur inaccessible.');
            
            isConnected = false;
            isConnecting = false;
            
            // Destruction propre de l'instance défaillante
            if (stompClient) {
                try { stompClient.disconnect(); } catch (e) {}
                stompClient = null;
            }

            // ✅ Stratégie de reconnexion infinie et résiliente (Exponential Backoff)
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            
            console.log(`🔄 Nouvelle tentative de connexion dans ${currentReconnectDelay / 1000} secondes...`);
            reconnectTimeout = setTimeout(() => {
                websocketService.connect();
            }, currentReconnectDelay);

            // Augmente le délai pour la prochaine tentative (Max 16 secondes)
            currentReconnectDelay = Math.min(currentReconnectDelay * 2, 16000);
        });
    },

    _processMessage: (body) => {
        try {
            // Tentative de parsing si c'est du JSON structural
            const data = JSON.parse(body);
            subscribers.forEach(callback => callback(data));
        } catch (e) {
            // Repli sur le texte brut si le parsing échoue
            subscribers.forEach(callback => callback(body));
        }
    },

    disconnect: (callbackToRemove) => {
        if (callbackToRemove) {
            subscribers.delete(callbackToRemove);
        }
        
        // Le WebSocket central ne se ferme que s'il n'y a absolument plus aucun composant actif à l'écoute
        if (subscribers.size === 0) {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            if (stompClient && isConnected) {
                stompClient.disconnect(() => {
                    console.log("🛑 WebSocket mis en veille (aucun composant actif).");
                });
            }
            
            stompClient = null;
            isConnected = false;
            isConnecting = false;
            currentReconnectDelay = 2000;
        }
    }
};