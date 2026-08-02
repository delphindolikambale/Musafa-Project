package com.school.management.security.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Cette classe intercepte les erreurs d'authentification et renvoie un code 401.
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        // ✅ Affiche l'URL exacte et la méthode HTTP (GET, POST, etc.) qui ont déclenché le blocage 401
        logger.error("Erreur 401 - Accès refusé sur [{}] {} : {}",
                request.getMethod(),
                request.getRequestURI(),
                authException.getMessage());

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Erreur: Non autorisé");
    }
}