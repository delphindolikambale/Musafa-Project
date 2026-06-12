package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DomainDTO { // Ajout de 'public' ici
    private String name;
    private List<SubDomainDTO> subDomains;
}