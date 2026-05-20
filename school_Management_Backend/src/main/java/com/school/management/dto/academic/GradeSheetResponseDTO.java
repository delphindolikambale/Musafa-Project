package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder

public class GradeSheetResponseDTO {

    private String studentName;
    private String classroomName;
    private String academicYear;
    private List<SubjectGradeDTO> subjectGrades;
    private double grandTotalObtained;
    private double grandTotalMax;
    private double percentage;
}
