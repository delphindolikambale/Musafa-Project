package com.school.management.dto.academic;
import com.school.management.model.enums.EvaluationType;
import lombok.Data;
import java.util.List;

@Data

public class EvaluationCreateDTO {
    private Long id; // Ajout du champ ID pour permettre la mise à jour et corriger l'erreur de compilation
    private String title;
    private EvaluationType type;
    private double maxPoints;
    private int period;
    private Long teacherAssignmentId;
    private List<StudentMarkDTO> marks;


}
