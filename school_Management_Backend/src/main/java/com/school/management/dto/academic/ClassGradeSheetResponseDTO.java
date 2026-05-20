package com.school.management.dto.academic;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ClassGradeSheetResponseDTO {

    private Long teacherAssignmentId;
    private String subjectName;
    private String classroomName;

    // Maxima configurés tirés de CourseAssignment
    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxS1;

    private double maxP3;
    private double maxP4;
    private double maxExam2;
    private double maxS2;

    private double maxTotalGeneral;

    // La liste de tous les élèves de la classe
    private List<StudentRowDTO> students;
}
