package com.school.management.dto.academic;
import lombok.Data;

@Data
public class DomainRequestDTO {

    private String name;
    private Integer orderIndex;
    private Long levelId;
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;

    // ID de la spécialité requise pour ce cours
    private Long requiredSpecialityId;
}
