package com.school.management.service.financialImpl;

import com.school.management.dto.financial.StudentReceiptDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.admin.SchoolConfiguration;
import com.school.management.model.financial.StudentAnnualFinancialProfile;
import com.school.management.model.financial.StudentPayment;
import com.school.management.repository.admin.SchoolConfigurationRepository;
import com.school.management.repository.financial.StudentPaymentRepository;
import com.school.management.service.financial.ReceiptService;
import com.school.management.util.NumberToWords;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final StudentPaymentRepository paymentRepository;
    private final SchoolConfigurationRepository configRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentReceiptDTO getReceiptData(Long paymentId, Long schoolId) {
        // ✅ Vérification d'appartenance du paiement à l'école connectée
        StudentPayment payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getAnnualProfile() != null
                        && p.getAnnualProfile().getAcademicYear() != null
                        && p.getAnnualProfile().getAcademicYear().getSchool() != null
                        && p.getAnnualProfile().getAcademicYear().getSchool().getId().equals(schoolId))
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable ou accès non autorisé."));

        // ✅ Récupération de la configuration propre à cette école (findBySchoolId assumé dans le repository)
        SchoolConfiguration config = configRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new IllegalStateException("Configuration spécifique manquante pour cet établissement"));

        StudentAnnualFinancialProfile profile = payment.getAnnualProfile();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        boolean hasScolarite = payment.getBreakdowns().stream()
                .anyMatch(b -> "SCOLARITE".equalsIgnoreCase(b.getFeesGroupName()));

        String motifPaiement;
        if (hasScolarite) {
            motifPaiement = "Frais Scolaires";
        } else if (!payment.getBreakdowns().isEmpty()) {
            motifPaiement = "Frais divers (" + payment.getBreakdowns().get(0).getFeesItemName() + ")";
        } else {
            motifPaiement = "Paiement frais scolaires";
        }

        return StudentReceiptDTO.builder()
                .schoolName(config.getSchoolName())
                .schoolSlogan(config.getSlogan())
                .schoolLogo(config.getLogoBase64())
                .schoolAddress(config.getAddress())
                .schoolPhone(config.getPhone())
                .schoolEmail(config.getEmail())
                .schoolWebsite(config.getWebsite())
                .studentRegNumber(profile.getFinancialAccount().getAccountNumber())
                .studentFullName(profile.getFinancialAccount().getStudent().getFullName())
                .classLevel(profile.getScheduleFees().getLevel().getName())
                .sectionOption(profile.getScheduleFees().getOption() != null ?
                        profile.getScheduleFees().getOption().getOptionName() : "")
                .receiptNumber(payment.getReceiptNumber())
                .paymentDate(payment.getPaymentDate().format(dateFormatter))
                .paymentTime(payment.getPaymentDate().format(timeFormatter))
                .amount(payment.getAmountPaid())
                .currency(payment.getCurrency().toString())
                .amountInWords(NumberToWords.convert(payment.getAmountPaid(), payment.getCurrency().toString()))
                .paymentFor(motifPaiement)
                .paymentMethod("Espèce")
                .cashierName(config.getDefaultCashierName())
                .build();
    }

    @Override
    public byte[] generateReceiptPdf(Long paymentId, Long schoolId) {
        return new byte[0];
    }
}