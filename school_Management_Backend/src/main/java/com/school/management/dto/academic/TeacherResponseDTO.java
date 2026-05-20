package com.school.management.dto.academic;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class TeacherResponseDTO {
    private Long id;
    private String schoolRegistrationNumber;
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
    private boolean active; // Retourne l'état actuel au frontend

    // Informations de spécialité adaptées
    private Long domainSpecialityId;
    private String domainSpecialityName;

    private List<AcademicTitleDTO> academicTitles;
    private List<TrainingDTO> trainings;
    private String profilePicturePath;
    private String cvPath;
    private String directoryPath;
}
