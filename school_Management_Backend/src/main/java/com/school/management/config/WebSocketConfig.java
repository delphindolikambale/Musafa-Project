package com.school.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Définition du broker pour diffuser les messages aux abonnés
        config.enableSimpleBroker("/topic");

        // Préfixe pour les messages envoyés depuis le client vers le serveur
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 1. Endpoint standard pour les clients WebSocket natifs (prioritaire et plus rapide)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // 2. Endpoint de secours avec SockJS (indispensable pour traverser les serveurs de routage de Render)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                // ✅ Gardien d'activité : Le serveur envoie un battement de coeur toutes les 10 secondes.
                // Cela empêche le routeur de Render de fermer la connexion pour cause d'inactivité.
                .setHeartbeatTime(10000);
    }
}