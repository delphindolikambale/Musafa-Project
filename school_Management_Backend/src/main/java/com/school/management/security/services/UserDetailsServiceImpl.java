package com.school.management.security.services;

import com.school.management.model.auth.User;
import com.school.management.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service chargé de récupérer l'utilisateur dans la base de données
 * pour le processus d'authentification.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le pseudo: " + username));

        // ✅ ADAPTATION MULTI-TENANT PROPRE : Sécurisation du Lazy Loading pour éviter les crashs d'authentification
        if (user.getSchool() != null) {
            try {
                user.getSchool().getId();
                user.getSchool().getName();
                user.getSchool().getCode();
                user.getSchool().isActive();
                user.getSchool().isSubscriptionActive();
                user.getSchool().isSchoolConfigured();
            } catch (Exception e) {
                logger.warn("[ALERTE] Échec du chargement des propriétés de l'école pour '{}': {}", username, e.getMessage());
            }
        } else {
            logger.info("[CONNEXION GLOBALE] L'utilisateur '{}' n'est rattaché à aucune école (Accès Super Admin).", username);
        }

        return UserDetailsImpl.build(user);
    }
}