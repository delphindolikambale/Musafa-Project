package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentInfoDTO { // Ajout de 'public' ici
    private String fullName;
    private String matricule;
    private String className;
}