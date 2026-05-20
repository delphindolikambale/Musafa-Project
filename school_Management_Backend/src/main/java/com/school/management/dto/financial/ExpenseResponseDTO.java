package com.school.management.dto.financial;
import com.school.management.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponseDTO {
    private Long id;
    private String voucherNumber;
    private String description;
    private BigDecimal amount;
    private Currency currency;
    private String feesGroupName;
    private String feesItemName;
    private String requestedBy;
    private String authorizedBy;
    private LocalDateTime expenseDate;
}
