package com.school.management.dto.academic;

import com.school.management.model.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScheduleSlotCreateDTO {

    @NotNull(message = "L'ID de l'école est obligatoire")
    private Long schoolId;

    @NotNull(message = "Le jour est obligatoire")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "La tranche horaire configurée (ID) est obligatoire")
    private Long hourSlotId; // Utilisation de l'ID relationnel dynamique

    @NotNull(message = "La classe est obligatoire")
    private Long classroomId;

    @NotNull(message = "La matière (Subject) est obligatoire")
    private Long subjectId;

    @NotNull(message = "L'enseignant est obligatoire")
    private Long teacherId;

    @NotNull(message = "L'année académique est obligatoire")
    private Long academicYearId;
}