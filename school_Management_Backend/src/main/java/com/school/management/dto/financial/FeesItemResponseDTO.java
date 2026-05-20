package com.school.management.dto.financial;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeesItemResponseDTO {
    private Long id;
    private Long academicYearId;
    private Long feesGroupId;
    private String feesGroupType;
    private String nameFeesItem;
    private BigDecimal percentage;
    private BigDecimal calculatedAmount; // <--- Nouveau : Le montant en monnaie
    private BigDecimal paidAmount;
    private boolean active;
}