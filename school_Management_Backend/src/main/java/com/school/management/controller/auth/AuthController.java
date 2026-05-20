package com.school.management.controller.auth;

import com.school.management.dto.auth.LoginRequest;
import com.school.management.dto.auth.JwtResponse;
import com.school.management.dto.auth.SignupRequest;
import com.school.management.model.auth.Role;
import com.school.management.model.auth.User;
import com.school.management.model.enums.AppRole;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.security.jwt.JwtUtils;
import com.school.management.security.services.UserDetailsImpl;
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

@CrossOrigin(origins = "http://localhost:5173") // Remplacez par le port affiché dans votre navigateur
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final TeacherRepository teacherRepository; // INJECTÉ : Pour vérifier les liaisons de profils

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // ADAPTATION : Tolérance mutuelle pour "ROLE_ENSEIGNANT" ou "ENSEIGNANT" lors de la récupération de la liaison
        Long teacherId = null;
        if (roles.contains("ROLE_ENSEIGNANT") || roles.contains("ENSEIGNANT")) {
            teacherId = teacherRepository.findByUserId(userDetails.getId())
                    .map(com.school.management.model.academic.Teacher::getId)
                    .orElse(null);
        }

        // On retourne la réponse enrichie de l'ID enseignant
        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                teacherId));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Erreur: Le nom d'utilisateur est déjà pris !");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Erreur: L'email est déjà utilisé !");
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
}
