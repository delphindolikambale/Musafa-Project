import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BACKEND_BASE } from './api';

let stompClient = null;
let isConnected = false;
let isConnecting = false; 
let subscribers = new Set(); // Pour les abonnements globaux (historique)
let dynamicSubscribers = new Map(); // NOUVEAU: Pour les abonnements spécifiques (multi-tenant/dynamique)
let stompSubscriptions = new Map(); // Pour stocker les objets de souscription STOMP actifs
let reconnectTimeout = null;
let currentReconnectDelay = 2000; // Délai initial de reconnexion (2 secondes)

export const websocketService = {
    connect: (onMessageReceived) => {
        // Ajout du callback global s'il est fourni
        if (onMessageReceived) {
            subscribers.add(onMessageReceived);
        }

        // Si le canal est déjà ouvert ou en cours d'établissement, on ne fait rien
        if (isConnected || isConnecting) {
            return;
        }

        isConnecting = true;
        
        // Initialisation de la connexion via SockJS (Idéal pour Render)
        const socket = new SockJS(`${BACKEND_BASE}/ws`);
        stompClient = Stomp.over(socket);
        
        // Masque les logs de débogage internes STOMP dans la console du navigateur
        stompClient.debug = () => {}; 

        // ✅ Battements de cœur bidirectionnels calés sur 10 secondes.
        stompClient.heartbeat.outgoing = 10000; 
        stompClient.heartbeat.incoming = 10000; 

        stompClient.connect({}, (frame) => {
            console.log('✅ WebSocket Connecté avec succès (Flux Mixtes STOMP/SockJS)');
            isConnected = true;
            isConnecting = false;
            currentReconnectDelay = 2000; // Réinitialisation du délai suite à une connexion réussie
            
            // Annulation de tout plan de reconnexion en attente
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            // --- Abonnements Globaux Historiques ---
            stompClient.subscribe('/topic/financial-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            stompClient.subscribe('/topic/finance-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            stompClient.subscribe('/topic/proviseur-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            // --- NOUVEAU: Rétablissement des abonnements dynamiques multi-tenants ---
            dynamicSubscribers.forEach((callbacks, topic) => {
                const subscription = stompClient.subscribe(topic, (message) => {
                    let data = message.body;
                    try { data = JSON.parse(message.body); } catch (e) {}
                    callbacks.forEach(cb => cb(data));
                });
                stompSubscriptions.set(topic, subscription);
            });

        }, (error) => {
            console.warn('⚠️ Connexion WebSocket interrompue ou serveur inaccessible.');
            
            isConnected = false;
            isConnecting = false;
            stompSubscriptions.clear(); // Destruction des références aux abonnements perdus
            
            // Destruction propre de l'instance défaillante
            if (stompClient) {
                try { stompClient.disconnect(); } catch (e) {}
                stompClient = null;
            }

            // Stratégie de reconnexion infinie et résiliente (Exponential Backoff)
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

    // NOUVEAU: Méthode pour s'abonner à un topic dynamique spécifique (ex: classe, titulaire, école)
    subscribeToTopic: (topic, callback) => {
        if (!dynamicSubscribers.has(topic)) {
            dynamicSubscribers.set(topic, new Set());
            
            // Si le serveur est déjà connecté, on active la souscription STOMP immédiatement
            if (isConnected && stompClient) {
                const subscription = stompClient.subscribe(topic, (message) => {
                    let data = message.body;
                    try { data = JSON.parse(message.body); } catch (e) {}
                    dynamicSubscribers.get(topic).forEach(cb => cb(data));
                });
                stompSubscriptions.set(topic, subscription);
            }
        }
        
        dynamicSubscribers.get(topic).add(callback);
        
        // Forcer la connexion globale si elle n'est pas encore active
        if (!isConnected && !isConnecting) {
            websocketService.connect();
        }
    },

    // NOUVEAU: Se désabonner d'un topic dynamique pour éviter les fuites mémoire
    unsubscribeFromTopic: (topic, callback) => {
        if (dynamicSubscribers.has(topic)) {
            dynamicSubscribers.get(topic).delete(callback);
            
            // S'il n'y a plus aucun composant à l'écoute sur ce topic, on le supprime proprement du serveur
            if (dynamicSubscribers.get(topic).size === 0) {
                dynamicSubscribers.delete(topic);
                
                if (stompSubscriptions.has(topic)) {
                    stompSubscriptions.get(topic).unsubscribe();
                    stompSubscriptions.delete(topic);
                }
            }
        }
        websocketService._checkAndSleep();
    },

    _processMessage: (body) => {
        let data = body;
        try {
            data = JSON.parse(body);
        } catch (e) {}
        subscribers.forEach(callback => callback(data));
    },

    disconnect: (callbackToRemove) => {
        if (callbackToRemove) {
            subscribers.delete(callbackToRemove);
        }
        websocketService._checkAndSleep();
    },

    _checkAndSleep: () => {
        // Le WebSocket central ne se ferme que s'il n'y a absolument plus aucun abonné (global ou dynamique) actif
        if (subscribers.size === 0 && dynamicSubscribers.size === 0) {
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
            stompSubscriptions.clear();
            currentReconnectDelay = 2000;
        }
    }
};