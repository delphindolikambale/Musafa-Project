package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponseDTO {
    private Long id;
    private String name;
    private Long domainId;
    private String domainName;
    private Long subDomainId;
    private String subDomainName;

    // --- NOUVEAUX CHAMPS POUR LE MODAL ---
    private String teacherFullName;
    private double weeklyHours;

    // Maxima
    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxP3;
    private double maxP4;
    private double maxExam2;

    // Totaux calculés
    private double maxS1;
    private double maxS2;
    private double maxTotal;
}