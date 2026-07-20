package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourSlotResponseDTO {
    private Long id;
    private Long schoolId;
    private Integer slotNumber;
    private String label;
}