package com.school.management.dto.financial;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class FeesGroupSummaryDTO {
    private Long groupId;
    private String groupName;
    private BigDecimal groupTotalUSD;
    private BigDecimal groupTotalCDF;
    private List<FeesItemSummaryDTO> items;
}
