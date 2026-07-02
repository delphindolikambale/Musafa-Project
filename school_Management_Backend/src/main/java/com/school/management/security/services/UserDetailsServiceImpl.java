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
 * <p>
 * pour le processus d'authentification.
 */

@Service

@RequiredArgsConstructor

public class UserDetailsServiceImpl implements UserDetailsService {


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

                System.out.println("[ALERTE] Échec du chargement des propriétés de l'école : " + e.getMessage());

            }

        } else {

            System.out.println("[CONNEXION GLOBALE] L'utilisateur " + username + " n'est rattaché à aucune école (Accès Super Admin).");

        }

        return UserDetailsImpl.build(user);

    }

}