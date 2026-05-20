package com.school.management.dto.academic;

import com.school.management.model.enums.EnrollmentType;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequestDTO {
    private Long studentId;
    private Long academicYearId;
    private Long classroomId;
    private EnrollmentType enrollmentType;

    // ✅ Ces deux listes doivent être de même taille et indexées de la même manière
    private List<String> documentsPresented; // Libellés (ex: "Acte de naissance")
    private List<MultipartFile> files;       // Fichiers binaires
}
