package com.school.management.security.jwt;

import com.school.management.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${school.app.jwtSecret}")
    private String jwtSecret;

    @Value("${school.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // ✅ NOUVEAU : Injection pour vérifier dynamiquement l'état d'onboarding de l'utilisateur
    @Autowired
    private com.school.management.repository.auth.UserRepository userRepository;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        Long schoolId = (userPrincipal.getSchool() != null) ? userPrincipal.getSchool().getId() : null;

        // ✅ NOUVEAU : Récupération en BDD pour injecter la contrainte de changement de mot de passe dans le Token
        boolean mustChangePassword = userRepository.findByUsername(userPrincipal.getUsername())
                .map(com.school.management.model.auth.User::isMustChangePassword)
                .orElse(false);

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .claim("schoolId", schoolId)
                // ✅ NOUVEAU : Claim lu par le Guard de routage React
                .claim("mustChangePassword", mustChangePassword)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

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