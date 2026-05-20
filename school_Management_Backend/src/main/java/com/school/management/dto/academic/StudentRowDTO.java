package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentRowDTO {
    private Long studentId;
    private String matricule;
    private String fullName;
    private String gender;

    // Semestre 1
    private double p1;
    private double p2;
    private double exam1;
    private double totalS1;

    // Semestre 2
    private double p3;
    private double p4;
    private double exam2;
    private double totalS2;

    // Total Général
    private double totalGeneral;
}
