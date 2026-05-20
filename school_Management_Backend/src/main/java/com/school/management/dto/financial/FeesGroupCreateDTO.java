package com.school.management.dto.financial;

import com.school.management.model.enums.FeesGroupType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class FeesGroupCreateDTO {
    /* =========================
        ANNÉE ACADÉMIQUE
        ========================= */
    @NotNull
    private Long academicYearId;
    /* =========================
       TYPE DU GROUPE
       ========================= */
    @NotNull
    private FeesGroupType type;
    /* =========================
       POURCENTAGE
       ========================= */
    @NotNull
    @Positive
    private BigDecimal percentage;
    /* =========================
       ÉTAT
       ========================= */
    private boolean active = true;
    /* =========================
       ITEMS (OPTIONNELS)
       ========================= */
    private List<FeesItemResponseDTO> feesItems;
}
