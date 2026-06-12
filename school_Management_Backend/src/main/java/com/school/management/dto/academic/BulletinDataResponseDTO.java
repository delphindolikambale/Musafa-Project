package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class BulletinDataResponseDTO {
    private StudentInfoDTO student;
    private List<DomainDTO> domains; // La hiérarchie complète
    private double totalObtained;
    private double totalMax;
    private double percentage;
}