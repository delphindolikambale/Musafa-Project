package com.school.management.service.academic;

import com.school.management.dto.academic.StudentFolderDTO;
import com.school.management.dto.academic.StudentSummaryDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ArchiveService {
    StudentFolderDTO getFullStudentArchive(String matricule);

    // CETTE LIGNE DOIT ÊTRE PRÉSENTE POUR CORRIGER L'ERREUR
    List<StudentSummaryDTO> getAllStudentsSummary();
}
