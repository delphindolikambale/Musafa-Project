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
public class DetailsCashTransactionResponseDTO {

    private Long id;
    private String academicYear;
    private String month;
    private LocalDateTime transactionDate;
    private String type;
    private String description;
    private String currency;
    private BigDecimal amount;
    private String actor;
    private String documentNumber;
}
