package com.school.management.dto.academic;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder

public class StudentFolderDTO {

    // Identité (Ce qui est écrit sur la "couverture" du dossier)
    private String matricule;
    private String lastName;
    private String postName;
    private String firstName;
    private String photoUrl;
    private String fatherInfo;
    private String motherInfo;
    private String currentStatus;
    // LES SOUS-DOSSIERS (Un dossier par année scolaire)
    private List<YearlyArchiveDTO> academicHistory;
}

