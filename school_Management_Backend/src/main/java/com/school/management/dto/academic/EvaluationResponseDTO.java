package com.school.management.dto.academic;

import com.school.management.model.enums.EvaluationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder

public class EvaluationResponseDTO {
    private Long id;
    private String title;
    private EvaluationType type;
    private double maxPoints;
    private int period;
    private LocalDate evaluationDate;
    private String subjectName;
    private String classroomName;
}
