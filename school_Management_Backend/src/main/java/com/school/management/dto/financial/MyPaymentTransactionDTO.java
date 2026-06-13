package com.school.management.dto.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPaymentTransactionDTO {
    private Long paymentId;
    private String receiptNumber;
    private BigDecimal amountPaid;
    private String currency;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    // On extrait le motif principal (ex: Frais Scolaires ou Frais divers)
    private String mainPurpose;
}