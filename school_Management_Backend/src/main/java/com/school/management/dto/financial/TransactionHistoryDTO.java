package com.school.management.dto.financial;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionHistoryDTO {

    private Long id;             // ID de la table transaction_history (pour DELETE)
    private Long sourceId;       // ID de la source (pour la réimpression du REÇU)
    private String type;
    private String label;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime transactionDate;
    private String referenceNumber;
    private String performedBy;
}
