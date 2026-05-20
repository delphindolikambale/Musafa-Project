package com.school.management.dto.financial;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FeesItemCreateDTO {

    @NotNull
    private Long academicYearId;

    @NotNull
    private Long feesGroupId;

    @NotBlank
    private String nameFeesItem;

    @NotNull
    @Positive
    private BigDecimal percentage;

}
