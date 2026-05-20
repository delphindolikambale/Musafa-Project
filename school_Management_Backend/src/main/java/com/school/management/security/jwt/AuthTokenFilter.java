package com.school.management.security.jwt;

import com.school.management.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre qui intercepte chaque requête HTTP pour vérifier la présence et la validité d'un JWT.
 * Imaginez que ce filtre est le "portier" de votre école.
 * À chaque fois qu'une requête arrive
 * (pour voir une liste d'élèves ou un reçu), ce portier
 * arrête la requête, regarde si elle possède un badge JWT, vérifie sa validité avec JwtUtils,
 * et si tout est correct, laisse passer la requête en disant au système :
 * "C'est bon, c'est le Comptable qui demande cela".
 */

public class AuthTokenFilter extends OncePerRequestFilter{

    @Autowired
    private JwtUtils jwtUtils; // Utilitaire pour manipuler le token

    @Autowired
    private UserDetailsServiceImpl userDetailsService; // Service pour charger l'utilisateur

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Extraire le JWT de l'en-tête "Authorization" de la requête
            String jwt = parseJwt(request);

            // 2. Si le token existe et qu'il est valide (vérification de la signature et expiration)
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                // 3. Récupérer le nom d'utilisateur contenu dans le token
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // 4. Charger les détails de l'utilisateur (rôles inclus) depuis la base de données
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Créer l'objet d'authentification que Spring Security utilise en interne
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 6. Ajouter les détails de la requête (IP, Session, etc.) à l'authentification
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Enregistrer l'utilisateur authentifié dans le "Context" de sécurité de Spring
                // À partir d'ici, l'utilisateur est considéré comme "Connecté" pour cette requête
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Impossible de définir l'authentification de l'utilisateur: {}", e.getMessage());
        }

        // 8. Passer la main au filtre suivant dans la chaîne (ou au contrôleur final)
        filterChain.doFilter(request, response);
    }

    /**
     * Méthode utilitaire pour extraire le token du header Authorization.
     * Le format attendu est : "Authorization: Bearer <TOKEN>"
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // On retire les 7 premiers caractères ("Bearer ")
        }

        return null;
    }
}
