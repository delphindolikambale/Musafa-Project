package com.school.management.dto.academic;

import com.school.management.model.enums.LevelType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LevelDTO {
    private Long id;
    private String name;       // ex: 7ème, 1ère
    private LevelType type;    // BASE ou OPTIONNEL
    private boolean active;
}
