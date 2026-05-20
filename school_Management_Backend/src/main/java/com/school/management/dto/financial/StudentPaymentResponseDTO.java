package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data

public class StudentPaymentResponseDTO {

    private Long id;
    private String receiptNumber;

    private Long annualProfileId;
    private String accountNumber;
    private String studentFullName;

    private BigDecimal amountPaid;
    private BigDecimal balanceAfterPayment;
    private BigDecimal creditAmount;

    private Currency currency;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    // Champ ajouté pour l'audit du caissier
    private String collectedBy;
}
