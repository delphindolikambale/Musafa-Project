package com.school.management.dto.academic;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class TeacherCreateDTO {
    private String nationalRegistrationNumber;
    private String lastName;
    private String middleName;
    private String firstName;
    private String gender;
    private String maritalStatus;
    private String placeOfBirth;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String email;
    private String residentialAddress;
    private boolean active = true; // Permet de définir le statut à la création

    // Gestion de la spécialité
    private Long domainSpecialityId;
    private String newSpecialityName; // Pour créer une spécialité si elle n'existe pas

    private List<AcademicTitleDTO> academicTitles;
    private List<TrainingDTO> trainings;
}
