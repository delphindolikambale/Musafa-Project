package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class FeesItemSummaryDTO {
    private String itemName;
    private BigDecimal amount;
    private Currency currency;
    private Double percentageOfGroup; // Calculé par rapport à la devise du groupe
}
