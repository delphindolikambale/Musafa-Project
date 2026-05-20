package com.school.management.dto.financial;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data

public class InstallmentScheduleDTO {
    @NotNull
    private Long scheduleFeesId;

    @NotNull
    private Integer installmentNumber;

    @NotNull
    @Positive
    private BigDecimal amount;
    // Ajoutez ce champ pour résoudre l'erreur "cannot find symbol getStartDate()"
    private LocalDate startDate;

    @NotNull
    private LocalDate dueDate;

    private Long levelId;
    private Long optionId;
}
