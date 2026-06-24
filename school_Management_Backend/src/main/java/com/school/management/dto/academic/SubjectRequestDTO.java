package com.school.management.dto.academic;

import com.school.management.model.enums.CourseCategory;
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
    private CourseCategory category;
    private Double hoursPerWeek;
}
