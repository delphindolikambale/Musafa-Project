package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubDomainResponseDTO {

    private Long id;
    private String name;
    private Long domainId;
    private String domainName;
    private int orderIndex;

    // Ajout des identifiants de contexte pour maintenir la cohérence lors des updates
    private Long levelId;
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;
}
