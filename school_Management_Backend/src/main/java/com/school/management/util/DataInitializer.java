package com.school.management.util;

import com.school.management.model.auth.Role;
import com.school.management.model.auth.User;
import com.school.management.model.enums.AppRole;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Composant chargé de créer les rôles et l'administrateur par défaut
 * si la base de données est vide au démarrage.
 */
@Component
@RequiredArgsConstructor

public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {

        // 1. INITIALISATION DES RÔLES
        // On vérifie si les rôles existent déjà pour ne pas les recréer inutilement
        if (roleRepository.count() == 0) {
            for (AppRole appRole : AppRole.values()) {
                roleRepository.save(Role.builder().name(appRole).build());
            }
            System.out.println("✅ Tous les rôles ont été insérés avec succès.");
        }

        // 2. CRÉATION DE L'ADMINISTRATEUR PAR DÉFAUT
        // On vérifie s'il n'y a pas déjà un utilisateur "admin"
        if (!userRepository.existsByUsername("admin")) {

            // On récupère le badge ROLE_ADMIN_SYSTEM en base
            Role adminRole = roleRepository.findByName(AppRole.ROLE_ADMIN_SYSTEM)
                    .orElseThrow(() -> new RuntimeException("Erreur: Le rôle Admin n'est pas trouvé."));

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            // On construit l'utilisateur Admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@ucbc.org")
                    .password(encoder.encode("admin123")) // ⚠️ MOT DE PASSE CRYPTÉ ICI
                    .roles(roles)
                    .isEnabled(true)
                    .isAccountNonLocked(true)
                    .build();

            userRepository.save(admin);
            System.out.println("🚀 Compte Administrateur créé : admin / admin123");
        }
    }
}
