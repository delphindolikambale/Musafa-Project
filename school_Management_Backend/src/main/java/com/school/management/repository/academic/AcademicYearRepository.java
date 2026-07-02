package com.school.management.repository.academic;

import com.school.management.model.academic.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité AcademicYear
 * Gère l'accès à la base de données avec isolation stricte par établissement (SaaS Multi-Tenant)
 */
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    // Vérifier si une année existe déjà au sein d'une même école
    boolean existsByAnneeAndSchoolId(String annee, Long schoolId);

    // Récupérer l'année scolaire active pour une école donnée
    Optional<AcademicYear> findByActiveTrueAndSchoolId(Long schoolId);

    // Récupérer toutes les années scolaires d'une seule école
    List<AcademicYear> findAllBySchoolId(Long schoolId);

    // Sécurité accrue : Trouver une année spécifique appartenant à une école spécifique
    Optional<AcademicYear> findByIdAndSchoolId(Long id, Long schoolId);
}