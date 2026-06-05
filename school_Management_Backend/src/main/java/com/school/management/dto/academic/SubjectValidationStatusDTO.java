package com.school.management.dto.academic;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class SubjectValidationStatusDTO {
    private Long teacherAssignmentId;
    private String subjectName;
    private String teacherName;
    private String status; // ex: DRAFT, EN_ATTENTE_VISA, VALIDATED_BY_PROVISEUR
    private LocalDateTime submissionDate;
    private LocalDateTime validationDate;
}