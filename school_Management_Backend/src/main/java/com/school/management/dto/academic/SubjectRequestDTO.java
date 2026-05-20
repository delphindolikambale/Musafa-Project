package com.school.management.dto.academic;

import lombok.Data;

@Data
public class SubjectRequestDTO {
    private String name;
    private Long domainId;
    private Long subDomainId;
    private Long levelId;
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;
}
