package com.school.management.dto.financial;

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
public class MyInstallmentStatusDTO {
    private Long installmentId;
    private Integer installmentNumber;
    private BigDecimal amountRequired;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;
    private LocalDate startDate;
    private LocalDate dueDate;
    private boolean fullyPaid;
}