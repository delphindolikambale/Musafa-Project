package com.school.management.dto.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HourSlotCreateDTO {

    @NotNull(message = "L'ID de l'école est obligatoire")
    private Long schoolId;

    @NotNull(message = "Le numéro du créneau est obligatoire")
    private Integer slotNumber;

    @NotBlank(message = "Le libellé de la tranche horaire est obligatoire")
    private String label;
}