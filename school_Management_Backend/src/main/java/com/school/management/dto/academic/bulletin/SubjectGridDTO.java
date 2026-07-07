package com.school.management.dto.academic.bulletin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectGridDTO {
    private Long subjectId;
    private String subjectName; // Assure l'affichage correct du nom !

    // Semestre 1
    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxTotalS1;

    // Semestre 2
    private double maxP3;
    private double maxP4;
    private double maxExam2;
    private double maxTotalS2;

    // Total Général
    private double maxTotalGen;
}