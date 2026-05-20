package com.school.management.dto.academic;

import lombok.*;

@Data // <-- Important : génère isActive() automatiquement pour les booleans
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionRequestDTO {
    private String sectionName;
    private boolean active; // <-- Doit correspondre à l'appel dans le service

}
