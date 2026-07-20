package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TitulaireMonitoringResponseDTO {
    private Long classroomId;
    private String classroomName;
    private int period;
    private List<SubjectValidationStatusDTO> subjects;

    // ✅ Renommé pour éviter la collision Jackson/Lombok lors de la sérialisation
    private boolean readyForBulletinGeneration;

    // ✅ Ajouté pour permettre à la condition Frontend d'afficher le composant UI
    private boolean hasBulletins;
}