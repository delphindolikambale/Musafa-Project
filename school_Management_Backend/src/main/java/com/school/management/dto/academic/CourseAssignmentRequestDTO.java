package com.school.management.dto.academic;

import lombok.Data;

@Data

public class CourseAssignmentRequestDTO {

    private Long subjectId;
    private Long levelId;
    private Long sectionId;
    private Long optionId;
    private Long academicYearId;
    private double maxP1;
    private double maxP2;
    private double maxExam1;
    private double maxP3;
    private double maxP4;
    private double maxExam2;
}
