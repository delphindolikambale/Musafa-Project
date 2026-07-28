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
        stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; 

        stompClient.heartbeat.outgoing = 10000; 
        stompClient.heartbeat.incoming = 10000; 

        stompClient.connect({}, (frame) => {
            console.log('✅ WebSocket Connecté avec succès (Service Central)');
            isConnected = true;
            isConnecting = false;
            currentReconnectDelay = 2000; 
            
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            
            // --- Abonnements Globaux ---
            stompClient.subscribe('/topic/financial-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            stompClient.subscribe('/topic/finance-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            stompClient.subscribe('/topic/proviseur-notifications', (message) => {
                if (message.body) websocketService._processMessage(message.body);
            });

            // --- Rétablissement des abonnements dynamiques multi-tenants ---
            dynamicSubscribers.forEach((callbacks, topic) => {
                const subscription = stompClient.subscribe(topic, (message) => {
                    let data = message.body;
                    try { data = JSON.parse(message.body); } catch (e) {}
                    callbacks.forEach(cb => cb(data));
                });
                stompSubscriptions.set(topic, subscription);
            });

        }, (error) => {
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
            
            if (stompClient && isConnected) {
                stompClient.disconnect(() => {
                    console.log("🛑 WebSocket mis en veille (aucun souscripteur actif).");
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