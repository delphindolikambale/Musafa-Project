package com.school.management.security.services;

import com.school.management.model.auth.User;
import com.school.management.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
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

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // On cherche l'utilisateur, s'il n'existe pas, on lance une exception claire
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le pseudo: " + username));

        // ✅ ADAPTATION MULTI-TENANT PROPRE : Force le chargement de l'école et de ses propriétés tant que la session Hibernate est ouverte
        if (user.getSchool() != null) {
            user.getSchool().getId();
            user.getSchool().getName();
            user.getSchool().getCode();
            user.getSchool().isActive();
            user.getSchool().isSubscriptionActive();
            user.getSchool().isSchoolConfigured();
        }

        // On transforme notre entité User en UserDetails pour Spring Security
        return UserDetailsImpl.build(user);
    }
}