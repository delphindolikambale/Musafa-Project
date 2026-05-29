package com.school.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ CORRECTION : Ajout de l'URL de Render pour éviter le blocage CORS du WebSocket en production
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "https://musafa-project.onrender.com",
                        "http://localhost:3000",
                        "http://localhost:517*",
                        "http://localhost:5180"
                )
                .withSockJS();
    }
}