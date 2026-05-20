package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

// DTO de réponse : Ce que Swagger/Postman affichera
@Data
@Builder

public class StudentPaymentBreakdownResponseDTO {

    private Long id;
    private Long feesGroupId;
    private String feesGroupName;
    private Long feesItemId;
    private String feesItemName;
    private BigDecimal amount;
    private Currency currency;
    private BigDecimal appliedPercentage;
}
