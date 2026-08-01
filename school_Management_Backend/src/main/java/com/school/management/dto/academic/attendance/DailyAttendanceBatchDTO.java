package com.school.management.dto.academic.attendance;

import com.school.management.model.enums.AttendanceSessionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DailyAttendanceBatchDTO {
    @NotNull(message = "L'école est obligatoire")
    private Long schoolId;

    @NotNull(message = "La classe est obligatoire")
    private Long classroomId;

    @NotNull(message = "L'année académique est obligatoire")
    private Long academicYearId;

    @NotNull(message = "L'enseignant titulaire est obligatoire")
    private Long teacherId;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    @NotNull(message = "Le type de session (MORNING/EVENING) est obligatoire")
    private AttendanceSessionType sessionType;

    @NotEmpty(message = "La liste des élèves ne peut pas être vide")
    @Valid
    private List<AttendanceEntryDTO> entries;
}