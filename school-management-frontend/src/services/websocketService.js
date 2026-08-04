import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BACKEND_BASE } from './api';

let stompClient = null;
let isConnected = false;
let isConnecting = false; 
let subscribers = new Set(); 
let dynamicSubscribers = new Map(); 
let stompSubscriptions = new Map(); 
let reconnectTimeout = null;
let currentReconnectDelay = 2000;

export const websocketService = {
    connect: (onMessageReceived) => {
        if (onMessageReceived) {
            subscribers.add(onMessageReceived);
        }

        if (isConnected || isConnecting) {
            return;
        }

        isConnecting = true;
        
        const socket = new SockJS(`${BACKEND_BASE}/ws`);
        const localStompClient = Stomp.over(socket);
        
        // On assigne au scope global mais on conserve une référence locale pour éviter les Race Conditions
        stompClient = localStompClient;
        localStompClient.debug = () => {}; 

        localStompClient.heartbeat.outgoing = 10000; 
        localStompClient.heartbeat.incoming = 10000; 

        localStompClient.connect({}, (frame) => {
            // SÉCURITÉ: Si un démontage React rapide a eu lieu et a écrasé stompClient, 
            // cette instance obsolète doit être abandonnée silencieusement.
            if (stompClient !== localStompClient) {
                try { localStompClient.disconnect(); } catch(e) {}
                return;
            }

            console.log('✅ WebSocket Connecté avec succès (Service Central)');
            isConnected = true;
            isConnecting = false;
            currentReconnectDelay = 2000; 
            
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            // --- Abonnements Globaux ---
            localStompClient.subscribe('/topic/financial-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            localStompClient.subscribe('/topic/finance-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            localStompClient.subscribe('/topic/proviseur-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            // --- Rétablissement des abonnements dynamiques multi-tenants ---
            dynamicSubscribers.forEach((callbacks, topic) => {
                const subscription = localStompClient.subscribe(topic, (message) => {
                    let data = message.body;
                    try { data = JSON.parse(message.body); } catch (e) {}
                    callbacks.forEach(cb => cb(data));
                });
                stompSubscriptions.set(topic, subscription);
            });

        }, (error) => {
            // SÉCURITÉ: Ignorer les erreurs des vieilles instances "orphelines"
            if (stompClient !== localStompClient) return;

            console.warn('⚠️ Connexion WebSocket interrompue. Reconnexion en cours...');
            
            isConnected = false;
            isConnecting = false;
            stompSubscriptions.clear(); 
            
            if (stompClient) {
                try { stompClient.disconnect(); } catch (e) {}
                stompClient = null;
            }

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            
            reconnectTimeout = setTimeout(() => {
                websocketService.connect();
            }, currentReconnectDelay);

            currentReconnectDelay = Math.min(currentReconnectDelay * 2, 16000);
        });
    },

    subscribeToTopic: (topic, callback) => {
        if (!dynamicSubscribers.has(topic)) {
            dynamicSubscribers.set(topic, new Set());
            
            if (isConnected && stompClient) {
                const subscription = stompClient.subscribe(topic, (message) => {
                    let data = message.body;
                    try { data = JSON.parse(message.body); } catch (e) {}
                    const cbs = dynamicSubscribers.get(topic);
                    if (cbs) cbs.forEach(cb => cb(data));
                });
                stompSubscriptions.set(topic, subscription);
            }
        }
        
        dynamicSubscribers.get(topic).add(callback);
        
        if (!isConnected && !isConnecting) {
            websocketService.connect();
        }
    },

    unsubscribeFromTopic: (topic, callback) => {
        if (dynamicSubscribers.has(topic)) {
            dynamicSubscribers.get(topic).delete(callback);
            
            if (dynamicSubscribers.get(topic).size === 0) {
                dynamicSubscribers.delete(topic);
                
                if (stompSubscriptions.has(topic)) {
                    try {
                        stompSubscriptions.get(topic).unsubscribe();
                    } catch (e) {
                        console.warn("Erreur désabonnement topic STOMP :", e);
                    }
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
        if (subscribers.size === 0 && dynamicSubscribers.size === 0) {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            if (stompClient) {
                if (isConnected) {
                    stompClient.disconnect(() => {
                        console.log("🛑 WebSocket mis en veille (aucun souscripteur actif).");
                    });
                } else if (stompClient.ws) {
                    // SÉCURITÉ: Si on était en cours de connexion, forcer la fermeture du socket sous-jacent 
                    // pour éviter qu'il aboutisse et plante dans le vide.
                    try { stompClient.ws.close(); } catch (e) {}
                }
            }
            
            stompClient = null;
            isConnected = false;
            isConnecting = false;
            stompSubscriptions.clear();
            currentReconnectDelay = 2000;
        }
    }
};