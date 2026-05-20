package com.school.management.security.jwt;

import com.school.management.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Import spécifique pour la gestion d'erreur
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets; // Pour transformer la clé en bytes proprement
import java.security.Key;
import java.util.Date;

/**
 * Classe utilitaire pour la gestion des Tokens JWT.
 * Version adaptée pour accepter tout type de caractères dans la clé secrète.
 */
@Component


public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${school.app.jwtSecret}")
    private String jwtSecret;

    @Value("${school.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    /**
     * Crée la clé de signature à partir de la chaîne de texte brute.
     * Cette version utilise UTF-8 au lieu de Base64 pour éviter les erreurs de décodage.
     */
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Génère un token après authentification réussie.
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256) // Signe le badge numériquement
                .compact();
    }

    /**
     * Récupère le pseudo de l'utilisateur à partir du badge (Token).
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Vérifie la validité du badge (Signature, expiration, intégrité).
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Signature JWT invalide: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Token JWT invalide: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("La chaîne des claims JWT est vide: {}", e.getMessage());
        }
        return false;
    }
}
