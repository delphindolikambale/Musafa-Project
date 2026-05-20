package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class OptionDTO {
    private Long id;
    private String optionName;
    private Long sectionId;
    private String sectionName; // Pour afficher "Technique" au lieu de juste "2" sur le front
    private boolean active;
}
