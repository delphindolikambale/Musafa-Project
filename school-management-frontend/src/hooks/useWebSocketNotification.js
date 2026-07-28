import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocketNotification = (schoolId, teacherId, onNotificationReceived) => {
    const callbackRef = useRef(onNotificationReceived);

    // Mettre à jour la référence sans déclencher de réabonnement WebSocket
    useEffect(() => {
        callbackRef.current = onNotificationReceived;
    }, [onNotificationReceived]);

    useEffect(() => {
        if (!schoolId || !teacherId) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[STOMP Hook]:', str);
                }
            },
        });

        stompClient.onConnect = () => {
            const topic = `/topic/bulletins/titulaire/${schoolId}/${teacherId}`;
            
            stompClient.subscribe(topic, (message) => {
                if (message.body) {
                    try {
                        const data = JSON.parse(message.body);
                        
                        // 1. Jouer le bip sonore
                        playNotificationSound();

                        // 2. Exécuter le callback du composant récepteur
                        if (callbackRef.current) {
                            callbackRef.current(data);
                        }
                    } catch (e) {
                        console.error("Erreur de parsing de la notification WebSocket :", e);
                    }
                }
            });
        };

        stompClient.onStompError = (frame) => {
            console.error('Erreur STOMP reçue dans le hook :', frame.headers['message']);
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [schoolId, teacherId]);
};

// Émission d'un signal sonore à la réception d'une notification
const playNotificationSound = () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Note Ré5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // Note La5

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.warn("Impossible d'émettre le son de notification :", e);
    }
};