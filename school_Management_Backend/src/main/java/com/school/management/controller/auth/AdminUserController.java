package com.school.management.controller.auth;

import com.school.management.dto.auth.RoleUpdateRequest;
import com.school.management.model.academic.Teacher;
import com.school.management.model.auth.Role;
import com.school.management.model.auth.User;
import com.school.management.model.enums.AppRole;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final TeacherRepository teacherRepository; // INJECTÉ : Pour gérer la liaison physique

    /**
     * NOUVEAU (Restauré) : Récupération de la liste des utilisateurs
     * ADAPTATION : Projection explicite pour injecter teacherId et formater les rôles sans casser l'architecture
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

            // Mappage structurel des rôles pour correspondre parfaitement à user.roles[0].name côté React
            List<Map<String, String>> rolesList = user.getRoles().stream().map(role -> {
                Map<String, String> rMap = new HashMap<>();
                rMap.put("name", role.getName().name());
                return rMap;
            }).collect(Collectors.toList());
            map.put("roles", rolesList);

            // Recherche directe et sécurisée de l'ID Enseignant lié en base de données
            Long teacherId = teacherRepository.findByUserId(user.getId())
                    .map(Teacher::getId)
                    .orElse(null);
            map.put("teacherId", teacherId);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Mise à jour complète : Rôles, Mot de passe et Liaison Enseignant
     * ADAPTATION : Nettoyage préventif des liaisons @OneToOne pour éviter les violations d'unicité
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_SYSTEM', 'ADMIN_SYSTEM')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé."));

        // 1. Mise à jour du Mot de passe (si fourni)
        if (updates.containsKey("password") && updates.get("password") != null) {
            String newPassword = (String) updates.get("password");
            if (!newPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
        }

        // 2. Mise à jour des Rôles (si fournis)
        if (updates.containsKey("roles")) {
            List<String> roleNames = (List<String>) updates.get("roles");
            Set<Role> roles = new HashSet<>();
            roleNames.forEach(name -> {
                AppRole appRole = AppRole.valueOf(name);
                Role r = roleRepository.findByName(appRole)
                        .orElseThrow(() -> new RuntimeException("Rôle " + name + " inexistant."));
                roles.add(r);
            });
            user.setRoles(roles);
        }

        // Sauvegarde immédiate de l'utilisateur pour consolider l'entité
        userRepository.save(user);

        // 3. ADAPTATION (Option B) : Liaison avec la fiche Enseignant du registre
        if (updates.containsKey("teacherId")) {
            Object teacherIdObj = updates.get("teacherId");

            // Dissocier l'ancien enseignant lié à cet utilisateur si une liaison existait déjà (évite les doublons de clés)
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
}
