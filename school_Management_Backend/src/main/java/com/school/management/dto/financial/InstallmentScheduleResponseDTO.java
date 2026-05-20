package com.school.management.dto.financial;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentScheduleResponseDTO {
    private Long id;
    private Integer installmentNumber;
    private BigDecimal amount;
    private BigDecimal amountPaid;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private Boolean paid;
    private String status; // NOUVEAU : Pour gérer l'affichage (PAYÉ, PARTIEL, ATTENTE)
    private Long scheduleFeesId;
    private Long levelId;
    private Long optionId;
}
