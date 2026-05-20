package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseAssignmentResponseDTO {

    private Long id;
    private Long subjectId;
    private String subjectName;

    // Indispensable pour reconstruire l'arbre dynamiquement
    private Long domainId;
    private String domainName;
    private Long subDomainId;
    private String subDomainName;

    private Long levelId;
    private String levelName;
    private String sectionName;
    private String optionName;

    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxP3;
    private double maxP4;
    private double maxExam2;

    // Nouveaux champs pour les totaux calculés côté Backend
    private double maxS1;
    private double maxS2;
    private double maxTotal;
}
