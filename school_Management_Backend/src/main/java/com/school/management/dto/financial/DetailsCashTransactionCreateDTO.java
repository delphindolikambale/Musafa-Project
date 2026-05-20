package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor

public class DetailsCashTransactionCreateDTO {
    private String academicYear;
    private String month;
    private TransactionType type;
    private String description;
    private Currency currency;
    private BigDecimal amount;
    private String actor;
    private String documentNumber;

}
