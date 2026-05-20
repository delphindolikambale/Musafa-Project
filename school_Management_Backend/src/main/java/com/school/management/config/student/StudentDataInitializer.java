package com.school.management.config.student;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.Gender;
import com.school.management.model.enums.StudentStatus;
import com.school.management.repository.academic.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDate;

@Configuration

public class StudentDataInitializer {
    @Bean
    CommandLineRunner initStudents(StudentRepository studentRepository) {
        return args -> {
            // Vérifie si l'élève existe déjà pour éviter les doublons
            if (!studentRepository.existsByPermanentNumber("RDC-2000-0005")) {

                Student student = Student.builder()
                        .permanentNumber("RDC-2000-0005")
                        .lastName("DON")
                        .postName("DANNY")
                        .firstName("KAMBALE")
                        .gender(Gender.MASCULIN)
                        .birthPlace("BENI")
                        .birthDate(LocalDate.of(2000, 5, 2))
                        .commune("BEU")
                        .quartier("BUTANUKA")
                        .fatherName("KAKULE")
                        .fatherProfession("CULTUVATEUR")
                        .motherName("MARIE")
                        .motherProfession("CULTIVATRICE")
                        // ✅ AJOUT INDISPENSABLE : On définit le statut initial
                        .status(StudentStatus.ACTIF)
                        .build();

                studentRepository.save(student);

                System.out.println("✅ Élève inséré avec succès !");
            } else {
                System.out.println("ℹ️ Élève déjà existant, aucun ajout.");
            }
        };
    }
}
