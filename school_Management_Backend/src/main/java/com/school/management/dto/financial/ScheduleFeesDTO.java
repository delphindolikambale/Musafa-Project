package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.PaymentFrequency;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ScheduleFeesDTO {

    // 📘 Contexte académique
    @NotNull
    private Long academicYearId;

    @NotNull
    private Long levelId;

    private Long optionId; // null si BASE

    // 💰 Configuration financière globale
    @NotNull
    private Currency currency; // ✅ AJOUT IMPORTANT

    @NotNull
    private BigDecimal totalAmount;

    @NotNull
    private Integer numberOfInstallments;

    @NotNull
    private PaymentFrequency paymentFrequency;

    // 🕒 Paramètre de génération des tranches
    @NotNull
    private LocalDate startDate;
}
