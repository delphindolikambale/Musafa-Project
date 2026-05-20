package com.school.management.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.school.management.model.auth.User;
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

public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore // Sécurité : on ne veut jamais que le mot de passe sorte du backend vers le frontend
    private String password;

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

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities);
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
