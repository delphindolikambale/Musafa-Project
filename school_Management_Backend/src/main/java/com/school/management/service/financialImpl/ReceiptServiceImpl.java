package com.school.management.service.financialImpl;

import com.itextpdf.layout.element.*;
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
    public StudentReceiptDTO getReceiptData(Long paymentId) {
        StudentPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));

        SchoolConfiguration config = configRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Configuration école manquante"));

        StudentAnnualFinancialProfile profile = payment.getAnnualProfile();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // --- LOGIQUE D'ADAPTATION DU MOTIF ---
        // On vérifie si l'un des breakdowns appartient au groupe "SCOLARITE"
        boolean hasScolarite = payment.getBreakdowns().stream()
                .anyMatch(b -> "SCOLARITE".equalsIgnoreCase(b.getFeesGroupName()));

        String motifPaiement;
        if (hasScolarite) {
            motifPaiement = "Frais Scolaires";
        } else if (!payment.getBreakdowns().isEmpty()) {
            // Si c'est uniquement des frais divers, on affiche "Frais divers" ou le nom du premier item
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
    public byte[] generateReceiptPdf(Long paymentId) { return new byte[0]; }
}