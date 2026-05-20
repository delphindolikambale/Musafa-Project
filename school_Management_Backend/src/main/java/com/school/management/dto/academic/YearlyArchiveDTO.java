package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder

public class YearlyArchiveDTO {

    // AJOUT DE L'ID : Indispensable pour l'opération de suppression
    private Long enrollmentId;
    private String academicYear;  // ex: "2024-2025"
    private String className;     // ex: "1ère Humanité"
    private String enrollmentType; // NOUVEAU / REINSCRIPTION
    private String result;        // Admis / Échoué / En cours

    // Les documents scannés de CETTE année précise
    private List<DocumentDTO> documents;

}
