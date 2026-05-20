package com.school.management.dto.academic;

import lombok.*;

@Data // Génère automatiquement getters, setters et isActive()
@NoArgsConstructor
@AllArgsConstructor

public class OptionRequestDTO {
    private String optionName;
    private Long sectionId;
    private boolean active; // Ajouté pour correspondre à la logique de mise à jour


}
