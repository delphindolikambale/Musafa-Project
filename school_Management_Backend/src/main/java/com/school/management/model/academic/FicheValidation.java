package com.school.management.model.academic;

import com.school.management.model.enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "fiche_validations")
@Data

public class FicheValidation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long classroomId;
    private Long subjectId;
    private String periodId; // Ex: "P1", "P2", "EX1"
    private Long academicYearId;
    private Long schoolId;

    @Enumerated(EnumType.STRING)
    private ValidationStatus status; // INITIALIZED, VALIDATED, ERROR_REPORTED

    private String titulaireName;
    private LocalDateTime validatedAt;
}
