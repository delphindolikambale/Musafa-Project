package com.school.management.dto.academic;

import lombok.Data;

@Data
public class SubDomainRequestDTO {

    private String name;
    private Long domainId;
    private int orderIndex;
    private Long levelId;
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;
}
