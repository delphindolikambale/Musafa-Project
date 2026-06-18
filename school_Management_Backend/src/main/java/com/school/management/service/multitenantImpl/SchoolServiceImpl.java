package com.school.management.service.multitenantImpl;

import com.school.management.dto.multitenant.SchoolCreateDTO;
import com.school.management.dto.multitenant.SchoolResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.enums.SubscriptionStatus;
import com.school.management.model.multitenant.School;
import com.school.management.model.multitenant.Subscription;
import com.school.management.model.multitenant.SystemSettings;
import com.school.management.repository.multitenant.SchoolRepository;
import com.school.management.repository.multitenant.SubscriptionRepository;
import com.school.management.repository.multitenant.SystemSettingsRepository;
import com.school.management.service.multitenant.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SystemSettingsRepository settingsRepository;

    @Override
    @Transactional
    public SchoolResponseDTO registerNewSchool(SchoolCreateDTO dto) {
        if (schoolRepository.existsByCode(dto.getCode())) {
            throw new IllegalStateException("Un établissement avec ce code d'identification unique existe déjà.");
        }
        if (schoolRepository.existsByName(dto.getName())) {
            throw new IllegalStateException("Une école portant cette dénomination est déjà enregistrée.");
        }

        // ✅ LOGIQUE : Génération sécurisée d'un token d'activation unique
        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // ADAPTATION : Remplacement du calcul fictif par l'e-mail explicite fourni par le DTO
        School school = School.builder()
                .name(dto.getName())
                .code(dto.getCode().toUpperCase())
                .province(dto.getProvince())
                .city(dto.getCity())
                .contactEmail(dto.getContactEmail()) // ✅ Extraction de l'e-mail du DTO mis à jour
                .activationCode(generatedCode)
                .isActive(false) // ✅ L'école est bloquée jusqu'à la saisie du code par l'utilisateur
                .isSubscriptionActive(false) // ✅ Initialisé à false par défaut pour la cohérence des filtres JWT
                .isSchoolConfigured(false)
                .build();

        School savedSchool = schoolRepository.save(school);

        Subscription subscription = Subscription.builder()
                .school(savedSchool)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(dto.getInitialSubscriptionMonths()))
                .status(SubscriptionStatus.SUSPENDU) // En attente du code secret
                .maxStudentsAllowed(dto.getMaxStudentsAllowed())
                .build();

        subscriptionRepository.save(subscription);

        // ✅ Notification immédiate de l'administrateur
        sendActivationEmail(savedSchool.getContactEmail(), savedSchool.getName(), generatedCode);

        return mapToResponseDTO(savedSchool, subscription);
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
            school.setSubscriptionActive(false); // ✅ ADAPTATION : Synchronisation de l'état de l'abonnement
            subscriptionRepository.save(sub);
        } else if (sub != null && activate && sub.getEndDate().isAfter(LocalDate.now())) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            school.setSubscriptionActive(true); // ✅ ADAPTATION : Synchronisation de l'état de l'abonnement
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
                .status(SubscriptionStatus.SUSPENDU) // Reste suspendu tant que le code n'est pas saisi
                .maxStudentsAllowed(latestSub != null ? latestSub.getMaxStudentsAllowed() : 1000)
                .build();

        subscriptionRepository.save(newSubscription);

        // ✅ LOGIQUE : Génération d'un nouveau jeton et coupure de l'accès direct jusqu'à activation
        String generatedCode = "ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        school.setActivationCode(generatedCode);
        school.setActive(false);
        school.setSubscriptionActive(false); // ✅ ADAPTATION : Révocation immédiate jusqu'à soumission du nouveau code
        schoolRepository.save(school);

        // ✅ Envoi simultané de la clé secrète
        sendActivationEmail(school.getContactEmail(), school.getName(), generatedCode);

        return mapToResponseDTO(school, newSubscription);
    }

    // ✅ NOUVEAU : Traitement autonome de déverrouillage depuis l'interface de l'école
    @Override
    @Transactional
    public void activateSchool(String schoolCode, String activationCode) {
        School school = schoolRepository.findByCode(schoolCode.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun établissement enregistré sous le code : " + schoolCode));

        if (school.getActivationCode() == null || !school.getActivationCode().equals(activationCode)) {
            throw new IllegalArgumentException("Le code secret d'activation est incorrect ou a expiré.");
        }

        // Libération des accès de l'établissement
        school.setActive(true);
        school.setSubscriptionActive(true); // ✅ ADAPTATION : Activation absolue du drapeau d'abonnement SaaS pour les Filtres
        school.setActivationCode(null); // Consommation sécurisée du code unique
        schoolRepository.save(school);

        // Transition de la souscription au statut actif
        Subscription sub = subscriptionRepository.findBySchoolIdOrderByEndDateDesc(school.getId())
                .stream().findFirst().orElse(null);
        if (sub != null) {
            sub.setStatus(SubscriptionStatus.ACTIF);
            subscriptionRepository.save(sub);
        }
    }

    // ✅ NOUVEAU : Validation d'intégrité de l'abonnement exploitée lors du login utilisateur
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

        // Synchronisation préventive en BDD si une divergence temporelle apparaît
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

    // ADAPTATION : Ajout du mappage des nouveaux champs pour le DTO de retour
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
                .contactEmail(school.getContactEmail())     // ✅ Donnée synchronisée
                .activationCode(school.getActivationCode()) // ✅ Clé synchronisée pour la visibilité admin
                .build();
    }

    // Interconnexion SMTP de simulation
    private void sendActivationEmail(String email, String schoolName, String code) {
        System.out.println("==================================================================");
        System.out.println("[SMTP SERVICE LOG] Envoi de la clé de déverrouillage SaaS");
        System.out.println("Destinataire : " + email);
        System.out.println("Établissement : " + schoolName);
        System.out.println("Code Secret Saisi : " + code);
        System.out.println("==================================================================");
    }
}