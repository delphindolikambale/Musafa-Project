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
import org.springframework.scheduling.annotation.Scheduled;

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

        School school = School.builder()
                .name(dto.getName())
                .code(dto.getCode().toUpperCase())
                .province(dto.getProvince())
                .city(dto.getCity())
                .contactEmail(dto.getContactEmail())
                .activationCode(null)
                .isActive(false)
                .isSubscriptionActive(false)
                .isSchoolConfigured(false)
                .build();

        School savedSchool = schoolRepository.saveAndFlush(school);

        Subscription subscription = Subscription.builder()
                .school(savedSchool)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(dto.getInitialSubscriptionMonths()))
                .status(SubscriptionStatus.SUSPENDU)
                .maxStudentsAllowed(dto.getMaxStudentsAllowed())
                .build();

        subscriptionRepository.saveAndFlush(subscription);

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
                    .defaultUsername(defaultUsername)
                    .defaultPasswordHashed(encoder.encode(defaultPassword))
                    .school(savedSchool)
                    .build();

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(AppRole.ROLE_ADMIN_SYSTEM)
                    .orElseThrow(() -> new RuntimeException("Erreur: Le rôle ROLE_ADMIN n'existe pas en base de données."));
            roles.add(adminRole);
            schoolAdmin.setRoles(roles);

            userRepository.saveAndFlush(schoolAdmin);
        }

        return mapToResponseDTO(savedSchool, subscription);
    }

    @Override
    @Transactional
    public SchoolResponseDTO recordSubscriptionPayment(Long schoolId, LocalDate endDate, Double amount, String currencyStr) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Établissement introuvable."));

        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Aucun historique d'abonnement trouvé pour cette école."));

        sub.setPaymentDate(LocalDate.now());
        sub.setEndDate(endDate);
        sub.setAmount(amount);
        sub.setPaymentMode("CASH");
        sub.setCurrency(Currency.valueOf(currencyStr.toUpperCase()));
        sub.setStatus(SubscriptionStatus.SUSPENDU);

        subscriptionRepository.saveAndFlush(sub);

        // ✅ GÉNÉRATION ET SAUVEGARDE STRICTE DE LA CLÉ
        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        school.setActivationCode(generatedCode);
        school.setSubscriptionActive(false);

        School updatedSchool = schoolRepository.saveAndFlush(school);

        String defaultUsername = "admin_" + updatedSchool.getCode().toLowerCase();
        sendActivationEmail(updatedSchool.getContactEmail(), updatedSchool.getName(), generatedCode, defaultUsername);

        return mapToResponseDTO(updatedSchool, sub);
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
            subscriptionRepository.saveAndFlush(sub);
        } else if (sub != null && activate && sub.getEndDate().isAfter(LocalDate.now())) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            school.setSubscriptionActive(true);
            school.setSchoolConfigured(true); // ✅ CORRECTION : L'activation manuelle par le SuperAdmin débloque isSchoolConfigured
            subscriptionRepository.saveAndFlush(sub);
        } else {
            school.setSubscriptionActive(false);
            if (activate) {
                school.setSchoolConfigured(true); // ✅ Garantie que la configuration passe à TRUE lors de l'activation
            }
        }

        School updated = schoolRepository.saveAndFlush(school);
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

        subscriptionRepository.saveAndFlush(newSubscription);

        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        school.setActivationCode(generatedCode);
        school.setActive(false);
        school.setSubscriptionActive(false);

        School updatedSchool = schoolRepository.saveAndFlush(school);

        String adminUsername = "admin_" + updatedSchool.getCode().toLowerCase();
        sendActivationEmail(updatedSchool.getContactEmail(), updatedSchool.getName(), generatedCode, adminUsername);

        return mapToResponseDTO(updatedSchool, newSubscription);
    }

    @Override
    @Transactional
    public void activateSchool(String schoolCode, String activationCode) {
        School school = schoolRepository.findByCode(schoolCode.toUpperCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun établissement enregistré sous le code : " + schoolCode));

        if (school.getActivationCode() == null || !school.getActivationCode().trim().equalsIgnoreCase(activationCode.trim())) {
            throw new IllegalArgumentException("Le code secret d'activation est incorrect ou a expiré.");
        }

        school.setActive(true);
        school.setSubscriptionActive(true);
        school.setSchoolConfigured(true); // ✅ DÉBLOQUE L'ADMIN DÉFINITIVEMENT
        school.setActivationCode(null);   // ✅ DÉTRUIT LA CLÉ APRÈS USAGE
        schoolRepository.saveAndFlush(school);

        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(school.getId())
                .stream().findFirst().orElse(null);
        if (sub != null) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            subscriptionRepository.saveAndFlush(sub);
        }
    }

    @Override
    @Transactional
    public boolean checkSchoolSubscription(Long schoolId) {
        School school = schoolRepository.findById(schoolId).orElse(null);
        if (school == null || !school.isActive()) {
            if (school != null && school.isSubscriptionActive()) {
                school.setSubscriptionActive(false);
                schoolRepository.saveAndFlush(school);
            }
            return false;
        }
        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(schoolId)
                .stream().findFirst().orElse(null);

        if (sub == null || sub.getEndDate().isBefore(LocalDate.now())) {
            if (school.isSubscriptionActive()) {
                school.setSubscriptionActive(false);
                schoolRepository.saveAndFlush(school);
            }
            return false;
        }

        boolean currentStatusActive = (sub.getStatus() == SubscriptionStatus.ACTIF);

        if (school.isSubscriptionActive() != currentStatusActive) {
            school.setSubscriptionActive(currentStatusActive);
            schoolRepository.saveAndFlush(school);
        }

        return currentStatusActive;
    }

    @Scheduled(cron = "0 0 7 * * ?")
    @Transactional
    public void runDailySubscriptionSecurityCheck() {
        List<School> schools = schoolRepository.findAll();
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        for (School school : schools) {
            Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(school.getId())
                    .stream().findFirst().orElse(null);

            if (sub != null && sub.getStatus() == SubscriptionStatus.ACTIF) {
                if (sub.getEndDate().equals(tomorrow)) {
                    sendExpirationWarningEmail(school.getContactEmail(), school.getName(), sub.getEndDate());
                }

                if (sub.getEndDate().isBefore(LocalDate.now()) || sub.getEndDate().equals(LocalDate.now())) {
                    sub.setStatus(SubscriptionStatus.SUSPENDU);
                    school.setSubscriptionActive(false);
                    schoolRepository.saveAndFlush(school);
                    subscriptionRepository.saveAndFlush(sub);
                }
            }
        }
    }

    private void sendExpirationWarningEmail(String toEmail, String schoolName, LocalDate expirationDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("⚠️ ALERTE ÉCHÉANCE : Abonnement MyAcademia expire dans 24 heures - " + schoolName);

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #f5c6cb; border-radius: 8px; max-width: 600px; background-color: #f8d7da;'>"
                    + "<h2 style='color: #721c24; text-align: center;'>⚠️ Rappel d'expiration d'abonnement</h2>"
                    + "<p>Bonjour l'Administration de <strong>" + schoolName + "</strong>,</p>"
                    + "<p>Nous vous informons que votre licence d'utilisation annuelle arrive à son terme demain, le <strong>" + expirationDate + "</strong>.</p>"
                    + "<p>Pour éviter une coupure de service et la réapparition de la barrière de réactivation sur vos écrans de connexion, veuillez procéder au règlement auprès du Super Administrateur.</p>"
                    + "<hr style='border: 0; border-top: 1px solid #f5c6cb;'/>"
                    + "<p style='font-size: 11px; color: #721c24; text-align: center;'>Ceci est une notification système automatique. Ne pas répondre.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[CRON SMTP ERROR] Échec de l'envoi de l'alerte d'échéance à : " + toEmail);
        }
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
        String statusStr = "AUCUN";
        if (sub != null) {
            statusStr = sub.getStatus().name();
            if (school.getActivationCode() != null && !school.getActivationCode().isEmpty()) {
                statusStr = "EN_ATTENTE_ACTIVATION";
            }
        }

        return SchoolResponseDTO.builder()
                .id(school.getId())
                .name(school.getName())
                .code(school.getCode())
                .province(school.getProvince())
                .city(school.getCity())
                .isActive(school.isActive())
                .subscriptionEndDate(sub != null ? sub.getEndDate() : null)
                .currentSubscriptionStatus(statusStr)
                .contactEmail(school.getContactEmail())
                .activationCode(school.getActivationCode())
                .build();
    }

    private void sendActivationEmail(String toEmail, String schoolName, String activationCode, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🚀 ACTIVATION : Clé de licence MyAcademia - " + schoolName);

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #c3e6cb; border-radius: 8px; max-width: 600px; background-color: #d4edda;'>"
                    + "<h2 style='color: #155724; text-align: center;'>🚀 Bienvenue sur MyAcademia !</h2>"
                    + "<p>Bonjour l'Administration de <strong>" + schoolName + "</strong>,</p>"
                    + "<p>Le paiement de votre abonnement a été enregistré avec succès par le Super Administrateur.</p>"
                    + "<p>Voici vos identifiants de connexion initiaux pour accéder à votre espace :</p>"
                    + "<ul>"
                    + "<li><strong>Nom d'utilisateur :</strong> " + username + "</li>"
                    + "<li><em>Le mot de passe initial vous a été communiqué de manière sécurisée par le gestionnaire de la plateforme.</em></li>"
                    + "</ul>"
                    + "<p>Pour débloquer définitivement les accès et finaliser la configuration de votre établissement, veuillez utiliser la clé de licence unique ci-dessous :</p>"
                    + "<div style='text-align: center; margin: 20px 0; padding: 15px; background-color: #ffffff; border: 2px dashed #28a745; border-radius: 4px;'>"
                    + "<span style='font-size: 20px; font-weight: bold; color: #28a745; letter-spacing: 2px;'>" + activationCode + "</span>"
                    + "</div>"
                    + "<hr style='border: 0; border-top: 1px solid #c3e6cb;'/>"
                    + "<p style='font-size: 11px; color: #155724; text-align: center;'>Ceci est une notification système automatique. Ne pas répondre.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[SMTP ERROR] Échec de l'envoi de l'e-mail d'activation à : " + toEmail);
        }
    }
}