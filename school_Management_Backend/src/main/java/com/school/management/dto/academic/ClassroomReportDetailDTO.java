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

public class ClassroomReportDetailDTO {

    // Infos pour l'en-tête
    private String schoolName;
    private String academicYearLabel;
    private String classroomName;

    // Stats rapides
    private int totalStudents;
    private int boysCount;
    private int girlsCount;

    // Liste détaillée des élèves
    private List<StudentRowDTO> students;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRowDTO {
        private String matricule;
        private String lastName;
        private String postName;
        private String firstName;
        private String gender;
        private String birthDate;
        private String birthPlace;
    }
}
