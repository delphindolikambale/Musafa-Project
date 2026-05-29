package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class DocumentDTO {
    private Long id;
    private String customName; // Le nom saisi (ex: Certificat)
    private String fileUrl;    // Le lien de téléchargement
    private String fileType;   // Le type (pdf, jpg)
    private String fileName;
}
