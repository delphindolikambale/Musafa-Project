package com.school.management.dto.academic;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder

public class EnrollmentResponseDTO {

    private Long id; // ID de l'inscription
    private Long studentId; // ID unique de l'élève (Crucial pour lier les notes au carnet)
    private String studentFullName;
    private String matricule;
    private String gender;
    private String classroomName;
    private Long classroomId;
    private String academicYear;
    private LocalDate enrollmentDate;

    // CORRECTION : Ajout du type d'inscription pour le retour JSON
    private String enrollmentType;

    private Integer capacity;
    private Long currentStudents;
    private Long availablePlaces;
    private boolean active;

    private List<DocumentDTO> documents;
}
