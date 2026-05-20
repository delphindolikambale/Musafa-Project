package com.school.management.dto.academic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DomainResponseDTO {

    private Long id;
    private String name;
    private Integer orderIndex;
    private Long levelId;
    private String levelName;

    // Ajout des champs manquants pour le retour API
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;
    // Informations de spécialité pour le retour API
    private Long requiredSpecialityId;
    private String requiredSpecialityName;

}
