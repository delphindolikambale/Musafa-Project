package com.school.management.dto.academic;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

@Data
public class ClassroomRequestDTO {
    @NotNull(message = "Le niveau est obligatoire")
    private Long levelId;

    private Long sectionId; // Optionnel selon le niveau
    private Long optionId;  // Optionnel selon le niveau

    private String division; // ex: "A", "B" ou "Unique"

    @NotNull(message = "Une salle physique doit être attribuée")
    private Long roomId;

    private boolean active = true;
}
