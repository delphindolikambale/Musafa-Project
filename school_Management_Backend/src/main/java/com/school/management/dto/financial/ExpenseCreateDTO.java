package com.school.management.dto.financial;

import com.school.management.model.enums.Currency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ExpenseCreateDTO {

    private String description;
    private BigDecimal amount;
    private Currency currency;
    private String requestedBy;
    private Long feesItemId; // La catégorie choisie par l'utilisateur
    private Long academicYearId;
}
