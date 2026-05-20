package com.school.management.dto.academic;

import com.school.management.model.enums.Gender;
import com.school.management.model.enums.StudentStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class StudentDTO {
    private Long id;
    private String matricule;
    private String permanentNumber;
    private String lastName;
    private String postName;
    private String firstName;
    private String fullName; // Calculé
    private Gender gender;
    private LocalDate birthDate;
    private String birthPlace;
    private StudentStatus status;
    private String commune;
    private String quartier;
    private String photoUrl;
}
