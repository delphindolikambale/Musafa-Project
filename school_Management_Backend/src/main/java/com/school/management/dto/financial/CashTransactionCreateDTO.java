package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.enums.TransactionType;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor

public class CashTransactionCreateDTO {

    private TransactionType type;
    private String description;
    private BigDecimal amount;
    private Currency currency;
    private Long feesGroupId;
    private Long feesItemId;
    private Long academicYearId;
}
