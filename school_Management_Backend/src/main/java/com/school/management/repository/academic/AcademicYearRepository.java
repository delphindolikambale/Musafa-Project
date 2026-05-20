package com.school.management.repository.academic;
import com.school.management.model.academic.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository pour l'entité AcademicYear
 * Gère l'accès à la base de données
 */

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    // Vérifier si une année existe déjà
    boolean existsByAnnee(String annee);

    // Récupérer l'année scolaire active
    Optional<AcademicYear> findByActiveTrue();
}
