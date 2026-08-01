package com.school.management.dto.academic.attendance;

import com.school.management.model.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceEntryDTO {
    @NotNull(message = "L'ID de l'élève est obligatoire")
    private Long studentId;

    @NotNull(message = "Le statut de présence est obligatoire")
    private AttendanceStatus status;

    private String remarks;
}