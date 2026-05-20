package com.school.management.dto.financial;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentSchedulePaymentResponseDTO {

    private Long id;

    // Identifiants techniques
    private Long installmentScheduleId;
    private Long studentPaymentId;

    // Informations métier essentielles pour Beni (clarté du reçu)
    private int installmentNumber; // Ex: "Tranche 1"
    private String receiptNumber;  // Ex: "RC-A1B2C3"

    private BigDecimal amountApplied; // Ce qui a été versé pour cette tranche
    private boolean fullyPaid;       // Est-ce que cette tranche est désormais soldée ?

    private LocalDateTime appliedAt;
}
