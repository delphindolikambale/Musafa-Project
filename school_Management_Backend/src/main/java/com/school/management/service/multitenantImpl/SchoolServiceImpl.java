package com.school.management.service.multitenantImpl;

import com.school.management.dto.multitenant.SchoolCreateDTO;
import com.school.management.dto.multitenant.SchoolResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.enums.SubscriptionStatus;
import com.school.management.model.enums.AppRole;
import com.school.management.model.enums.Currency;
import com.school.management.model.multitenant.School;
import com.school.management.model.multitenant.Subscription;
import com.school.management.model.multitenant.SystemSettings;
import com.school.management.model.auth.User;
import com.school.management.model.auth.Role;
import com.school.management.repository.multitenant.SchoolRepository;
import com.school.management.repository.multitenant.SubscriptionRepository;
import com.school.management.repository.multitenant.SystemSettingsRepository;
import com.school.management.repository.auth.UserRepository;
import com.school.management.repository.auth.RoleRepository;
import com.school.management.service.multitenant.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SystemSettingsRepository settingsRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;

    // ✅ AJOUT : Injection du service d'envoi d'e-mail Spring Boot
    private final JavaMailSender mailSender;

    @Override
    @Transactional
    public SchoolResponseDTO registerNewSchool(SchoolCreateDTO dto) {
        if (schoolRepository.existsByCode(dto.getCode())) {
            throw new IllegalStateException("Un établissement avec ce code d'identification unique existe déjà.");
        }
        if (schoolRepository.existsByName(dto.getName())) {
            throw new IllegalStateException("Une école portant cette dénomination est déjà enregistrée.");
        }

        // L'école démarre sans code d'activation tant qu'elle n'a pas payé l'abonnement
        School school = School.builder()
                .name(dto.getName())
                .code(dto.getCode().toUpperCase())
                .province(dto.getProvince())
                .city(dto.getCity())
                .contactEmail(dto.getContactEmail())
                .activationCode(null) // Devient généré uniquement après le paiement effectif
                .isActive(false)
                .isSubscriptionActive(false)
                .isSchoolConfigured(false)
                .build();

        School savedSchool = schoolRepository.save(school);

        Subscription subscription = Subscription.builder()
                .school(savedSchool)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(dto.getInitialSubscriptionMonths()))
                .status(SubscriptionStatus.SUSPENDU)
                .maxStudentsAllowed(dto.getMaxStudentsAllowed())
                .build();

        subscriptionRepository.save(subscription);

        String defaultUsername = "admin_" + savedSchool.getCode().toLowerCase();
        String defaultPassword = "Admin@" + savedSchool.getCode().toUpperCase() + "2026!";

        if (!userRepository.existsByUsername(defaultUsername)) {
            User schoolAdmin = User.builder()
                    .username(defaultUsername)
                    .email(savedSchool.getContactEmail())
                    .password(encoder.encode(defaultPassword))
                    .isAccountNonLocked(true)
                    .isEnabled(true)
                    .mustChangePassword(true)
                    .defaultUsername(defaultUsername) // Stockage de sécurité pour la comparaison stricte
                    .defaultPasswordHashed(encoder.encode(defaultPassword)) // Empreinte de référence
                    .school(savedSchool)
                    .build();

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(AppRole.ROLE_ADMIN_SYSTEM)
                    .orElseThrow(() -> new RuntimeException("Erreur: Le rôle ROLE_ADMIN n'existe pas en base de données."));
            roles.add(adminRole);
            schoolAdmin.setRoles(roles);

            userRepository.save(schoolAdmin);
        }

        return mapToResponseDTO(savedSchool, subscription);
    }

    // Nouvelle méthode métier appelée depuis l'interface d'enregistrement des Abonnements du SuperAdmin
    @Transactional
    public SchoolResponseDTO recordSubscriptionPayment(Long schoolId, LocalDate endDate, Double amount, String currencyStr) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Établissement introuvable."));

        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Aucun historique d'abonnement trouvé pour cette école."));

        // Enregistrement des données financières réelles de l'abonnement
        sub.setPaymentDate(LocalDate.now());
        sub.setEndDate(endDate);
        sub.setAmount(amount);
        sub.setPaymentMode("CASH");
        sub.setCurrency(Currency.valueOf(currencyStr.toUpperCase()));
        sub.setStatus(SubscriptionStatus.SUSPENDU); // Reste suspendu tant que l'école n'a pas tapé le code d'activation

        subscriptionRepository.save(sub);

        // Génération automatique et affectation de la clé secrète d'activation
        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        school.setActivationCode(generatedCode);
        schoolRepository.save(school);

        String defaultUsername = "admin_" + school.getCode().toLowerCase();

        // ✅ ADAPTATION : Envoi réel de l'e-mail avec la clé d'activation
        sendActivationEmail(school.getContactEmail(), school.getName(), generatedCode, defaultUsername);

        return mapToResponseDTO(school, sub);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolResponseDTO> getAllSchools() {
        return schoolRepository.findAll().stream().map(school -> {
            Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(school.getId())
                    .stream().findFirst().orElse(null);
            return mapToResponseDTO(school, sub);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SchoolResponseDTO toggleSchoolAccess(Long schoolId, boolean activate) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Établissement introuvable."));

        school.setActive(activate);

        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst().orElse(null);

        if (sub != null && !activate) {
            sub.setStatus(SubscriptionStatus.SUSPENDU);
            school.setSubscriptionActive(false);
            subscriptionRepository.save(sub);
        } else if (sub != null && activate && sub.getEndDate().isAfter(LocalDate.now())) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            school.setSubscriptionActive(true);
            subscriptionRepository.save(sub);
        } else {
            school.setSubscriptionActive(false);
        }

        School updated = schoolRepository.save(school);
        return mapToResponseDTO(updated, sub);
    }

    @Override
    @Transactional
    public SchoolResponseDTO renewSubscription(Long schoolId, int additionalMonths) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Établissement introuvable."));

        Subscription latestSub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst().orElse(null);

        LocalDate newStart = (latestSub != null && latestSub.getEndDate().isAfter(LocalDate.now()))
                ? latestSub.getEndDate() : LocalDate.now();

        Subscription newSubscription = Subscription.builder()
                .school(school)
                .startDate(newStart)
                .endDate(newStart.plusMonths(additionalMonths))
                .status(SubscriptionStatus.SUSPENDU)
                .maxStudentsAllowed(latestSub != null ? latestSub.getMaxStudentsAllowed() : 1000)
                .build();

        subscriptionRepository.save(newSubscription);

        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        school.setActivationCode(generatedCode);
        school.setActive(false);
        school.setSubscriptionActive(false);
        schoolRepository.save(school);

        String adminUsername = "admin_" + school.getCode().toLowerCase();
        sendActivationEmail(school.getContactEmail(), school.getName(), generatedCode, adminUsername);

        return mapToResponseDTO(school, newSubscription);
    }

    @Override
    @Transactional
    public void activateSchool(String schoolCode, String activationCode) {
        School school = schoolRepository.findByCode(schoolCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun établissement enregistré sous le code : " + schoolCode));

        if (school.getActivationCode() == null || !school.getActivationCode().equals(activationCode)) {
            throw new IllegalArgumentException("Le code secret d'activation est incorrect ou a expiré.");
        }

        school.setActive(true);
        school.setSubscriptionActive(true);
        school.setActivationCode(null);
        schoolRepository.save(school);

        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(school.getId())
                .stream().findFirst().orElse(null);
        if (sub != null) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            subscriptionRepository.save(sub);
        }
    }

    @Override
    @Transactional
    public boolean checkSchoolSubscription(Long schoolId) {
        School school = schoolRepository.findById(schoolId).orElse(null);
        if (school == null || !school.isActive()) {
            if (school != null && school.isSubscriptionActive()) {
                school.setSubscriptionActive(false);
                schoolRepository.save(school);
            }
            return false;
        }
        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst().orElse(null);

        if (sub == null || sub.getEndDate().isBefore(LocalDate.now())) {
            if (school.isSubscriptionActive()) {
                school.setSubscriptionActive(false);
                schoolRepository.save(school);
            }
            return false;
        }

        boolean currentStatusActive = (sub.getStatus() == SubscriptionStatus.ACTIF);

        if (school.isSubscriptionActive() != currentStatusActive) {
            school.setSubscriptionActive(currentStatusActive);
            schoolRepository.save(school);
        }

        return currentStatusActive;
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettings getSystemSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> settingsRepository.save(new SystemSettings()));
    }

    @Override
    @Transactional
    public SystemSettings updateSystemSettings(String appName, MultipartFile logo) {
        SystemSettings settings = getSystemSettings();
        settings.setApplicationName(appName);

        if (logo != null && !logo.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + logo.getOriginalFilename();
                Path rootPath = Paths.get(System.getProperty("user.dir")).resolve("storage/system");
                Files.createDirectories(rootPath);
                Files.copy(logo.getInputStream(), rootPath.resolve(filename));
                settings.setGlobalLogoPath("storage/system/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l'enregistrement du logo système", e);
            }
        }
        return settingsRepository.save(settings);
    }

    private SchoolResponseDTO mapToResponseDTO(School school, Subscription sub) {
        return SchoolResponseDTO.builder()
                .id(school.getId())
                .name(school.getName())
                .code(school.getCode())
                .province(school.getProvince())
                .city(school.getCity())
                .isActive(school.isActive())
                .subscriptionEndDate(sub != null ? sub.getEndDate() : null)
                .currentSubscriptionStatus(sub != null ? sub.getStatus().name() : "AUCUN")
                .contactEmail(school.getContactEmail())
                .activationCode(school.getActivationCode())
                .build();
    }

    // ✅ ADAPTATION : Remplacement du log console par un véritable envoi d'e-mail HTML formaté
    private void sendActivationEmail(String toEmail, String schoolName, String licenseCode, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔑 Clé de Licence et Activation - " + schoolName);

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;'>"
                    + "<h2 style='color: #0056b3; text-align: center;'>Félicitations ! Votre paiement a été validé.</h2>"
                    + "<p>Bonjour l'Administration de <strong>" + schoolName + "</strong>,</p>"
                    + "<p>Le Super Administrateur de la plateforme vient d'enregistrer la réception des frais d'activation de votre abonnement.</p>"
                    + "<hr style='border: 0; border-top: 1px solid #eee;'/>"
                    + "<h3 style='color: #333;'>Vos Identifiants Provisoires d'Accès :</h3>"
                    + "<p><strong>Nom d'utilisateur Admin :</strong> <span style='background: #f4f4f4; padding: 3px 8px; border-radius: 4px; font-family: monospace;'>" + username + "</span></p>"
                    + "<p style='color: #666; font-size: 13px;'>*Le mot de passe par défaut a été transmis lors de la création de l'école.*</p>"
                    + "<div style='background-color: #e8f4fd; border: 1px solid #b8daff; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;'>"
                    + "<h4 style='margin: 0 0 10px 0; color: #004085;'>VOTRE CLÉ SECRÈTE D'ACTIVATION UNIQUE :</h4>"
                    + "<span style='font-size: 24px; font-weight: bold; color: #721c24; letter-spacing: 2px; font-family: monospace;'>" + licenseCode + "</span>"
                    + "</div>"
                    + "<p style='font-size: 13px; color: #ffc107; font-weight: bold;'>⚠️ Attention : Ce code d'activation est à usage unique. Il vous sera demandé lors de votre connexion pour débloquer votre espace de travail.</p>"
                    + "<hr style='border: 0; border-top: 1px solid #eee;'/>"
                    + "<p style='font-size: 11px; color: #777; text-align: center;'>Ceci est un message automatique du serveur central de gestion multitenant. Ne pas répondre.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[SMTP SUCCESS] Le mail d'activation a été envoyé avec succès à : " + toEmail);

        } catch (Exception e) {
            System.err.println("[SMTP ERROR] Échec critique de l'envoi du mail d'activation à " + toEmail);
            e.printStackTrace();
        }
    }
}