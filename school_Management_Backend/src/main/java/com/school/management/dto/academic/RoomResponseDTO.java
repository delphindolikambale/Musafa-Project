package com.school.management.dto.academic;

import lombok.Data;

@Data
public class RoomResponseDTO {
    private Long id;
    private String name;
    private Integer capacity;
    private String building;
    private boolean active;
}
