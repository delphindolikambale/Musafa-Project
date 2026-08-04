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

    // ✅ CORRECTION CRUCIALE : Ajout du Numéro d'Identification Nationale (N° ID.)
    // Obligatoire pour le mappage de l'en-tête du bulletin
    private String nationalId;

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

    // ✅ CORRECTION : Ajout des informations parentales pour garantir la complétude du dossier
    private String fatherName;
    private String fatherProfession;
    private String motherName;
    private String motherProfession;

    private String photoUrl;

    // Champs optionnels souvent utiles pour l'aplatissement de la classe et de l'année
    private String classLevel;
    private String schoolYear;
}