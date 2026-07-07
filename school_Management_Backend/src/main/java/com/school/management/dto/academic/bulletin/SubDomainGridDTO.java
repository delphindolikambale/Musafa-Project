package com.school.management.dto.academic.bulletin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubDomainGridDTO {
    private Long subDomainId;
    private String subDomainName;

    private List<SubjectGridDTO> subjects;

    // Sous-totaux des maxima pour le sous-domaine
    private double subMaxP1;
    private double subMaxP2;
    private double subMaxExam1;
    private double subMaxTotalS1;

    private double subMaxP3;
    private double subMaxP4;
    private double subMaxExam2;
    private double subMaxTotalS2;

    private double subMaxTotalGen;
}