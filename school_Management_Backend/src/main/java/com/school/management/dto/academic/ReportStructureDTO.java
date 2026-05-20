package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReportStructureDTO {

    private Long academicYearId;
    private String academicYearLabel;
    private List<ClassroomReportSummary> classrooms;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ClassroomReportSummary {
        private Long classroomId;
        private String classroomName;
        private long totalStudents;
        private long boyCount;
        private long girlCount;
        private int capacity;
        private double occupancyRate; // Pourcentage d'occupation de la classe
    }

}
