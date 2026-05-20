package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor

public class CashTransactionResponseDTO {

    private Long id;
    private LocalDateTime transactionDate; // Nom exact requis pour le Builder
    private TransactionType type;
    private Currency currency;
    private BigDecimal entryAmount;
    private BigDecimal exitAmount;
    private BigDecimal balance;
    private String description;
    private String feesGroupName;
    private String feesItemName;
}
