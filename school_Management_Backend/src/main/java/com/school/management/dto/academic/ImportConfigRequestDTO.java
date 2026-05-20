package com.school.management.dto.academic;

import lombok.Data;

@Data
public class ImportConfigRequestDTO {
    private Long sourceYearId;
    private Long targetYearId;
    private Long levelId;
    private Long sectionId;
    private Long optionId;
}
