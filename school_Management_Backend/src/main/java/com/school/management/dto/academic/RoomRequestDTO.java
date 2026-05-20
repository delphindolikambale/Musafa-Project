package com.school.management.dto.academic;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoomRequestDTO {

    @NotBlank(message = "Le nom de la salle est obligatoire")
    private String name;

    @Min(value = 1, message = "La capacité doit être d'au moins 1")
    private Integer capacity;

    private String building;
    private boolean active = true;
}
