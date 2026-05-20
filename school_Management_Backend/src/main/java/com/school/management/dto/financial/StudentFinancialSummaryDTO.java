package com.school.management.dto.financial;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class StudentFinancialSummaryDTO {
    private String accountNumber;
    private String studentFullName;
    private String currentClassroom;
    private BigDecimal totalBalance;
    private BigDecimal previousYearsDebt;
    private boolean hasDebt;
    private String currency;
    private Long annualProfileId;

    // Champs pour l'affichage détaillé du barème (Image 2)
    private BigDecimal totalFeeAmount; // Montant total dû (ex: 250$)
    private List<FeesGroupResponseDTO> feeBreakdown; // Répartition théorique Groupes/Items
}
