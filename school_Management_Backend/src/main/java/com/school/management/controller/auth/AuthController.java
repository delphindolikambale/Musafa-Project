package com.school.management.controller.auth;

import com.school.management.dto.auth.LoginRequest;
import com.school.management.dto.auth.JwtResponse;
import com.school.management.dto.auth.SignupRequest;
import com.school.management.model.auth.Role;
import com.school.management.model.auth.User;
import com.school.management.model.multitenant.School;
import com.school.management.model.enums.AppRole;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.security.jwt.JwtUtils;
import com.school.management.security.services.UserDetailsImpl;
import com.school.management.service.multitenant.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final TeacherRepository teacherRepository;
    private final SchoolService schoolService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // JOURNALISATION DE DIAGNOSTIC
        userRepository.findByUsername(loginRequest.getUsername()).ifPresent(user -> {
            boolean matches = encoder.matches(loginRequest.getPassword(), user.getPassword());
            System.out.println("[DIAGNOSTIC AUTH] Utilisateur trouvé : " + user.getUsername());
            System.out.println("[DIAGNOSTIC AUTH] Hash stocké en BDD : " + user.getPassword());
            System.out.println("[DIAGNOSTIC AUTH] Correspondance brute de l'encodeur : " + matches);
        });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        User userEntity = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Erreur: Utilisateur non trouvé après authentification."));

        // ✅ ANALYSE ET SÉCURISATION DU RÔLE - MISE EN COHÉRENCE AVEC APPROLE
        boolean isSuperAdmin = roles.contains("ROLE_SUPER_ADMIN_SYSTEM") || roles.contains("SUPER_ADMIN_SYSTEM");
        boolean isAdminSystem = roles.contains("ROLE_ADMIN_SYSTEM") || roles.contains("ADMIN_SYSTEM") || roles.contains("ADMIN") || roles.contains("ROLE_ADMIN");

        // ✅ DOUBLE VERROU SAAS REVISITÉ : Exemption pour Super Admin et Admin System (pour éviter le blocage technique à la connexion)
        if (!isSuperAdmin && !isAdminSystem) {
            if (userEntity.getSchool() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Accès refusé : Votre compte n'est lié à aucun établissement enregistré sur la plateforme.\"}");
            }
            if (!userEntity.getSchool().isActive()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Accès refusé : L'établissement " + userEntity.getSchool().getName() + " est actuellement suspendu par la plateforme.\"}");
            }
        }

        // ✅ LOGIQUE EXTRACTRICE SAAS : On récupère dynamiquement l'état de l'établissement
        Long schoolId = null;
        String schoolCode = null;
        boolean isSubscriptionActive = false;
        boolean isSchoolConfigured = false;

        if (userEntity.getSchool() != null) {
            School school = userEntity.getSchool();
            schoolId = school.getId();
            schoolCode = school.getCode();
            // Validation dynamique via le service de licence
            isSubscriptionActive = schoolService.checkSchoolSubscription(school.getId());
            isSchoolConfigured = school.isSchoolConfigured();
        }

        // ADAPTATION : Traitement de la liaison Enseignant
        Long teacherId = null;
        if (roles.contains("ROLE_ENSEIGNANT") || roles.contains("ENSEIGNANT")) {
            teacherId = teacherRepository.findByUserId(userDetails.getId())
                    .map(com.school.management.model.academic.Teacher::getId)
                    .orElse(null);
        }

        // ✅ RÉSULTAT : On retourne la réponse enrichie des métadonnées SaaS sans bloquer le flux de connexion
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                teacherId,
                schoolId,
                schoolCode,
                isSubscriptionActive,
                isSchoolConfigured
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("{\"error\": \"Erreur: Le nom d'utilisateur est déjà pris !\"}");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("{\"error\": \"Erreur: L'email est déjà utilisé !\"}");
        }

        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<Role> roles = new HashSet<>();

        Role userRole = roleRepository.findByName(AppRole.ROLE_ELEVE)
                .orElseThrow(() -> new RuntimeException("Erreur: Le rôle ROLE_ELEVE n'est pas trouvé en base de données."));

        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok("Utilisateur enregistré avec succès avec le rôle ÉLÈVE !");
    }

    @PostMapping("/init-superadmin")
    public ResponseEntity<?> initSuperAdmin() {

        userRepository.findByUsername("superadmin").ifPresent(user -> {
            userRepository.delete(user);
            System.out.println("[PURGE SYSTEM] Ancien compte superadmin supprimé avec succès.");
        });

        User superAdmin = new User();
        superAdmin.setUsername("superadmin");
        superAdmin.setEmail("admin@myacademia.com");
        superAdmin.setPassword(encoder.encode("admin123"));
        superAdmin.setAccountNonLocked(true);
        superAdmin.setEnabled(true);
        superAdmin.setSchool(null);

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(AppRole.ROLE_SUPER_ADMIN_SYSTEM)
                .orElseThrow(() -> new RuntimeException("Erreur: Le rôle ROLE_SUPER_ADMIN_SYSTEM n'existe pas dans la table roles."));

        roles.add(adminRole);
        superAdmin.setRoles(roles);

        userRepository.save(superAdmin);

        return ResponseEntity.ok("Compte Super Admin réinitialisé à zéro avec succès ! (Utilisateur: superadmin | Mot de passe: admin123)");
    }
}