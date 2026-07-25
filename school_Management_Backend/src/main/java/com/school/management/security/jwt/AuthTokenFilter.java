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

                        String path = request.getRequestURI();
                        // ✅ EXCEPTION : On élargit les routes d'onboarding/anciennes autorisées
                        boolean isAuthOrActivationRoute = path.contains("/api/auth/") || path.contains("/activate") || path.contains("/public/") || path.contains("/ws/");
                        boolean isSchoolAdmin = userPrincipal.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN_SYSTEM") || a.getAuthority().equals("ADMIN_SYSTEM"));

                        // 2. L'établissement doit être actif sur la plateforme
                        if (!userPrincipal.getSchool().isActive()) {
                            // Si ce n'est pas l'admin sur une route autorisée d'onboarding, on bloque l'accès
                            if (!isAuthOrActivationRoute || !isSchoolAdmin) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"error\": \"L'accès à l'application est suspendu pour votre établissement. Veuillez contacter le support de la plateforme.\"}");
                                return;
                            }
                        }

                        // 3. Contrôle de l'Abonnement Expiré
                        if (!userPrincipal.getSchool().isSubscriptionActive() && !isAuthOrActivationRoute) {
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
        if (StringUtils.hasText(headerAuth) && headerAuth.toLowerCase().startsWith("bearer ")) {
            String token = headerAuth.substring(7).trim();
            // ✅ Nettoyage des guillemets doubles si le token en contient
            if (token.startsWith("\"") && token.endsWith("\"") && token.length() > 1) {
                token = token.substring(1, token.length() - 1);
            }
            return token;
        }
        return null;
    }
}