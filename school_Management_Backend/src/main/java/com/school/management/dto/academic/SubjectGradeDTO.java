package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubjectGradeDTO {

    private String subjectName;
    // Points obtenus par période
    private double p1;
    private double p2;
    private double examen1;
    // Maxima configurés
    private double maxP1;
    private double maxP2;
    private double maxExamen1;
    // Totaux
    private double totalSemestre1;
    private double maxSemestre1;
}
