package com.school.management.dto.academic;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ClassroomDTO {
    private Long levelId;
    private Long sectionId;
    private Long optionId;

    private Integer capacity;
    private boolean active = true;
}
