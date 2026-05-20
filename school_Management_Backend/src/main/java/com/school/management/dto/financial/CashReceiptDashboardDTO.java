package com.school.management.dto.financial;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class CashReceiptDashboardDTO {
    private String academicYear;
    private String periodLabel;

    // Totaux Généraux (Inclus déjà la soustraction des dépenses à l'avenir)
    private BigDecimal totalGeneralUSD;
    private BigDecimal totalGeneralCDF;

    private List<FeesGroupSummaryDTO> groups;
}
