package com.school.management.dto.academic;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class TitulaireMonitoringResponseDTO {
    private Long classroomId;
    private String classroomName;
    private int period;
    private List<SubjectValidationStatusDTO> subjects;

    // Un booléen pratique pour le Frontend : true si TOUTES les matières sont validées par le Proviseur
    private boolean isReadyForBulletinGeneration;
}