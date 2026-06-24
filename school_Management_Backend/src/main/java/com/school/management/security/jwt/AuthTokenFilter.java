package com.school.management.security.jwt;

import com.school.management.security.services.UserDetailsImpl;
import com.school.management.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (userDetails instanceof UserDetailsImpl userPrincipal) {
                    // ✅ ADAPTATION : Vérification stricte du rôle Super Admin basée sur l'Enum
                    boolean isSuperAdmin = userPrincipal.getAuthorities().stream()
                            .anyMatch(grantedAuthority ->
                                    grantedAuthority.getAuthority().equals("ROLE_SUPER_ADMIN_SYSTEM") ||
                                            grantedAuthority.getAuthority().equals("SUPER_ADMIN_SYSTEM")
                            );

                    // ✅ VALIDATION MULTI-TENANT STRICTE POUR LES RÔLES LOCAUX
                    if (!isSuperAdmin) {

                        // 1. L'utilisateur doit impérativement avoir une école associée
                        if (userPrincipal.getSchool() == null) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"Erreur de cloisonnement : Aucun établissement associé à ce compte.\"}");
                            return;
                        }

                        // 2. L'établissement doit être actif sur la plateforme
                        if (!userPrincipal.getSchool().isActive()) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"L'accès à l'application est suspendu pour votre établissement. Veuillez contacter le support de la plateforme.\"}");
                            return;
                        }

                        // 3. Contrôle de l'Abonnement Expiré
                        String path = request.getRequestURI();
                        // Exception cruciale : on laisse passer les requêtes d'authentification et les routes d'activation de licence
                        boolean isActivationRoute = path.contains("/api/auth/") || path.contains("/activate");

                        if (!userPrincipal.getSchool().isSubscriptionActive() && !isActivationRoute) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"L'abonnement de votre établissement a expiré. Veuillez renouveler votre licence pour débloquer l'accès.\"}");
                            return;
                        }
                    }
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Impossible de définir l'authentification de l'utilisateur: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        // ADAPTATION : Rendre la vérification du "Bearer" insensible à la casse pour éviter les rejets en production par les proxys
        if (StringUtils.hasText(headerAuth) && headerAuth.toLowerCase().startsWith("bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}