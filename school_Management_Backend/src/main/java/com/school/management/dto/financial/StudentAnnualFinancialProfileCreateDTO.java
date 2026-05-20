package com.school.management.dto.financial;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor

public class StudentAnnualFinancialProfileCreateDTO {

    @NotNull(message = "L'identifiant du compte financier est obligatoire")
    private Long financialAccountId;

    @NotNull(message = "L'identifiant de l'année académique est obligatoire")
    private Long academicYearId;

    @NotNull(message = "L'identifiant de l'inscription (Enrollment) est obligatoire")
    private Long enrollmentId;

    @NotNull(message = "L'identifiant de la grille tarifaire (ScheduleFees) est obligatoire")
    private Long scheduleFeesId;
}
