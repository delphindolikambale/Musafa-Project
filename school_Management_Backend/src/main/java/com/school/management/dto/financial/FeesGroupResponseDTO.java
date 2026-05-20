package com.school.management.dto.financial;

import com.school.management.model.enums.FeesGroupType;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class FeesGroupResponseDTO {

    private Long id;

    /* =========================
       ANNÉE ACADÉMIQUE
       ========================= */
    private Long academicYearId;

    /* =========================
       DONNÉES MÉTIER
       ========================= */
    private FeesGroupType type;
    private BigDecimal percentage;
    private BigDecimal calculatedAmount; // <--- Nouveau : Le montant en monnaie
    private BigDecimal paidAmount;
    private boolean active;

    /* =========================
       ITEMS
       ========================= */
    private List<FeesItemResponseDTO> feesItems;

}
