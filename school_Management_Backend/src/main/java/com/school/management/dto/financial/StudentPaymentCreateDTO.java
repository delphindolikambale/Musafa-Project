package com.school.management.dto.financial;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentPaymentCreateDTO {

    @NotNull
    private Long annualProfileId;

    @NotNull
    @Positive
    private BigDecimal amountPaid;

    @NotNull
    private String paymentMethod;

}
