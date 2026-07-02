package com.school.management.service.multitenant;

import com.school.management.dto.multitenant.SchoolCreateDTO;
import com.school.management.dto.multitenant.SchoolResponseDTO;
import com.school.management.model.multitenant.SystemSettings;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface SchoolService {
    SchoolResponseDTO registerNewSchool(SchoolCreateDTO dto);
    List<SchoolResponseDTO> getAllSchools();
    SchoolResponseDTO toggleSchoolAccess(Long schoolId, boolean activate);
    SchoolResponseDTO renewSubscription(Long schoolId, int additionalMonths);

    // ✅ AJOUTS : Contrats de validation de l'abonnement et d'activation autonome
    void activateSchool(String schoolCode, String activationCode);
    boolean checkSchoolSubscription(Long schoolId);

    // ✅ AJOUT MANQUANT : Enregistrement du paiement d'Abonnement depuis le SuperAdmin
    SchoolResponseDTO recordSubscriptionPayment(Long schoolId, LocalDate endDate, Double amount, String currencyStr);

    SystemSettings getSystemSettings();
    SystemSettings updateSystemSettings(String appName, MultipartFile logo);
}