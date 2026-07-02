package com.school.management.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.school.management.controller.academic.AcademicYearController; // ✅ AJOUT : Importation de l'interface de marquage
import com.school.management.model.auth.User;
import com.school.management.model.multitenant.School; // ✅ AJOUT : Importation de l'entité School
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Cette classe sert d'interface entre notre entité User et le moteur Spring Security.
 * C'est le pont indispensable pour que le moteur de sécurité puisse comparer les mots de passe et vérifier les rôles.
 */
@Getter
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails, AcademicYearController.SchoolContextDetails { // ✅ MODIFICATION : Implémentation du contrat d'extraction d'école

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore // Sécurité : on ne veut jamais que le mot de passe sorte du backend vers le frontend
    private String password;

    // ✅ AJOUT : Le champ school permettant de propager l'école dans le contexte de sécurité
    private School school;

    // Liste des rôles convertis en "Authorities" pour Spring
    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        // Conversion adaptative et sécurisée : on génère le rôle avec ET sans le préfixe "ROLE_"
        // Cela blinde l'application peu importe si vous utilisez .hasRole(), .hasAuthority() ou @PreAuthorize
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .flatMap(role -> {
                    String roleName = role.getName().name();
                    String cleanRole = roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
                    String prefixedRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                    return Stream.of(
                            new SimpleGrantedAuthority(cleanRole),
                            new SimpleGrantedAuthority(prefixedRole)
                    );
                })
                .collect(Collectors.toList());

        // ✅ MODIFICATION : Passage de user.getSchool() au constructeur pour alimenter le nouveau champ
        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getSchool(),
                authorities);
    }

    /**
     * ✅ AJOUT SÉCURISÉ : Vérifie de manière robuste si l'utilisateur possède le rôle Super Admin
     */
    public boolean isSuperAdminSystem() {
        return authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("SUPER_ADMIN_SYSTEM") || a.getAuthority().equals("ROLE_SUPER_ADMIN_SYSTEM"));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}