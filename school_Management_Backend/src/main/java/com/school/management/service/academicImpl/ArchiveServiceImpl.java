package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DocumentDTO;
import com.school.management.dto.academic.StudentFolderDTO;
import com.school.management.dto.academic.StudentSummaryDTO;
import com.school.management.dto.academic.YearlyArchiveDTO;
import com.school.management.model.academic.Enrollment;
import com.school.management.model.academic.Student;
import com.school.management.model.academic.StudentDocument;
import com.school.management.repository.academic.EnrollmentRepository;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.service.academic.ArchiveService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ArchiveServiceImpl implements ArchiveService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentFolderDTO getFullStudentArchive(String matricule) {
        Student student = studentRepository.findByMatricule(matricule)
                .orElseThrow(() -> new EntityNotFoundException("Élève avec le matricule " + matricule + " introuvable"));

        // Récupère tout l'historique (Inscriptions passées et présente)
        List<Enrollment> history = enrollmentRepository.findAllHistoryByMatricule(matricule);

        List<YearlyArchiveDTO> academicHistory = history.stream()
                .map(this::mapToYearlyDTO)
                .collect(Collectors.toList());

        return StudentFolderDTO.builder()
                .matricule(student.getMatricule())
                .lastName(student.getLastName())
                .postName(student.getPostName())
                .firstName(student.getFirstName())
                .photoUrl(student.getPhotoUrl())
                .currentStatus(student.getStatus() != null ? student.getStatus().name() : "INCONNU")
                .fatherInfo(student.getFatherName())
                .motherInfo(student.getMotherName())
                .academicHistory(academicHistory)
                .build();
    }

    /**
     * ✅ Transforme une inscription en archive annuelle avec ses documents intelligents
     */
    private YearlyArchiveDTO mapToYearlyDTO(Enrollment e) {
        return YearlyArchiveDTO.builder()
                .enrollmentId(e.getId())
                .academicYear(e.getAcademicYear() != null ? e.getAcademicYear().getAnnee() : "N/A")
                .className(e.getClassroom() != null ? e.getClassroom().getDisplayName() : "N/A")
                .enrollmentType(e.getEnrollmentType() != null ? e.getEnrollmentType().name() : "N/A")
                .result(e.isActive() ? "En cours" : "Clôturé")
                // ✅ Utilisation directe de la relation avec StudentDocument
                .documents(e.getDocuments().stream()
                        .map(this::mapToDocumentDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * ✅ Nouvelle méthode de mapping dédiée aux documents pour éviter les erreurs de type
     */
    private DocumentDTO mapToDocumentDTO(StudentDocument doc) {
        return DocumentDTO.builder()
                .id(doc.getId())
                .customName(doc.getCustomName()) // Le libellé saisi par l'utilisateur
                .fileUrl(doc.getFileUrl())       // L'URL pour le bouton "Ouvrir"
                .fileName(doc.getFileName())     // ✅ AJOUT : Transmet le nom réel du fichier physique avec son extension (.pdf, .png, etc.)
                .fileType(determineFileTypeLabel(doc.getFileName())) // Label pour l'icône
                .build();
    }

    /**
     * Détermine un label lisible pour le type de fichier
     */
    private String determineFileTypeLabel(String fileName) {
        if (fileName == null) return "Document";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "Fichier PDF";
        if (lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg")) return "Image/Scan";
        return "Document officiel";
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSummaryDTO> getAllStudentsSummary() {
        return studentRepository.findAll().stream()
                .map(s -> StudentSummaryDTO.builder()
                        .matricule(s.getMatricule())
                        .fullName(s.getFirstName() + " " + s.getLastName())
                        .photoUrl(s.getPhotoUrl())
                        .build())
                .collect(Collectors.toList());
    }
}
