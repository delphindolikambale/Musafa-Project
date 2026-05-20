package com.school.management.dto.academic;

import com.school.management.model.enums.LevelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class LevelCreateDTO {

    @NotBlank
    private String name;

    @NotNull
    private LevelType type;

    private boolean active;
}
