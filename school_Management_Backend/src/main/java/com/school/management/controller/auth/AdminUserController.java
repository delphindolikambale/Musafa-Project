package com.school.management.controller.auth;

import com.school.management.dto.auth.RoleUpdateRequest;
import com.school.management.model.academic.Teacher;
import com.school.management.model.academic.Student;
import com.school.management.model.auth.Role;
import com.school.management.model.auth.User;
import com.school.management.model.enums.AppRole;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherRepository teacherRepository;

    /**
     * Récupération de la liste des utilisateurs
     */
    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_SYSTEM', 'ADMIN_SYSTEM')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> response = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("accountNonLocked", user.isAccountNonLocked());
            map.put("enabled", user.isEnabled());

            List<Map<String, String>> rolesList = user.getRoles().stream().map(role -> {
                Map<String, String> rMap = new HashMap<>();
                rMap.put("name", role.getName().name());
                return rMap;
            }).collect(Collectors.toList());
            map.put("roles", rolesList);

            Long teacherId = teacherRepository.findByUserId(user.getId())
                    .map(Teacher::getId)
                    .orElse(null);
            map.put("teacherId", teacherId);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Création complète d'un utilisateur
     * ADAPTATION : Tolérance syntaxique accrue sur les enums de rôles pour éviter les rejets silencieux
     */
    @PostMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_SYSTEM', 'ADMIN_SYSTEM')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        String username = (String) userData.get("username");
        String email = (String) userData.get("email");
        String password = (String) userData.get("password");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Erreur: Le nom d'utilisateur est déjà pris !");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Erreur: L'adresse email est déjà utilisée !");
        }

        // Encodage strict et immédiat du mot de passe en clair reçu du formulaire React
        User user = new User(username, email, passwordEncoder.encode(password));

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            user.setSchool(((UserDetailsImpl) principal).getSchool());
        }

        // Assignation sécurisée des rôles avec nettoyage de préfixe
        if (userData.containsKey("roles")) {
            List<String> roleNames = (List<String>) userData.get("roles");
            Set<Role> roles = new HashSet<>();

            for (String name : roleNames) {
                AppRole appRole = null;
                try {
                    appRole = AppRole.valueOf(name);
                } catch (IllegalArgumentException e) {
                    // Essayer sans le préfixe ROLE_ si la correspondance directe échoue
                    String cleanedName = name.startsWith("ROLE_") ? name.substring(5) : name;
                    try {
                        appRole = AppRole.valueOf(cleanedName);
                    } catch (IllegalArgumentException ex) {
                        // Essayer AVEC le préfixe ROLE_ si l'énumération l'exige
                        try {
                            appRole = AppRole.valueOf("ROLE_" + cleanedName);
                        } catch (IllegalArgumentException finalEx) {
                            return ResponseEntity.badRequest().body("Erreur : Le rôle " + name + " n'existe pas dans le système.");
                        }
                    }
                }

                Role r = roleRepository.findByName(appRole)
                        .orElseThrow(() -> new RuntimeException("Rôle " + name + " introuvable en base de données."));
                roles.add(r);
            }
            user.setRoles(roles);
        }

        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur créé avec succès.");
    }

    /**
     * Mise à jour complète d'un utilisateur
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_SYSTEM', 'ADMIN_SYSTEM')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        if (updates.containsKey("password") && updates.get("password") != null) {
            String newPassword = (String) updates.get("password");
            if (!newPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
        }

        if (updates.containsKey("roles")) {
            List<String> roleNames = (List<String>) updates.get("roles");
            Set<Role> roles = new HashSet<>();

            for (String name : roleNames) {
                AppRole appRole = null;
                try {
                    appRole = AppRole.valueOf(name);
                } catch (IllegalArgumentException e) {
                    String cleanedName = name.startsWith("ROLE_") ? name.substring(5) : name;
                    try {
                        appRole = AppRole.valueOf(cleanedName);
                    } catch (IllegalArgumentException ex) {
                        try {
                            appRole = AppRole.valueOf("ROLE_" + cleanedName);
                        } catch (IllegalArgumentException finalEx) {
                            return ResponseEntity.badRequest().body("Erreur : Le rôle " + name + " n'existe pas.");
                        }
                    }
                }
                Role r = roleRepository.findByName(appRole)
                        .orElseThrow(() -> new RuntimeException("Rôle " + name + " inexistant."));
                roles.add(r);
            }
            user.setRoles(roles);
        }

        userRepository.save(user);

        if (updates.containsKey("teacherId")) {
            Object teacherIdObj = updates.get("teacherId");

            teacherRepository.findByUserId(user.getId()).ifPresent(oldTeacher -> {
                oldTeacher.setUser(null);
                teacherRepository.save(oldTeacher);
            });

            if (teacherIdObj != null && !teacherIdObj.toString().isEmpty()) {
                Long teacherId = Long.valueOf(teacherIdObj.toString());
                Teacher teacher = teacherRepository.findById(teacherId)
                        .orElseThrow(() -> new RuntimeException("Erreur: Enseignant physique introuvable."));
                teacher.setUser(user);
                teacherRepository.save(teacher);
            }
        }

        return ResponseEntity.ok("Utilisateur et liaisons mis à jour avec succès.");
    }

    /**
     * Suppression d'un utilisateur
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_SYSTEM', 'ADMIN_SYSTEM')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        teacherRepository.findByUserId(id).ifPresent(teacher -> {
            teacher.setUser(null);
            teacherRepository.save(teacher);
        });

        userRepository.delete(user);
        return ResponseEntity.ok("Utilisateur supprimé avec succès.");
    }
}