package com.school.management.service.academicImpl;

import com.school.management.model.academic.AcademicYear;
import com.school.management.repository.academic.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service métier pour la gestion des années scolaires.
 * Gère le calendrier académique et l'internationalisation des périodes.
 */
@Service
@RequiredArgsConstructor
public class AcademicYearService {
    private final AcademicYearRepository academicYearRepository;

    /**
     * Créer ou mettre à jour une année scolaire.
     * Inclut la logique pour garantir qu'une seule année est active à la fois.
     */
    @Transactional
    public AcademicYear save(AcademicYear academicYear) {

        // 1. Vérifier si l'année existe déjà (uniquement pour les nouvelles créations)
        if (academicYear.getId() == null && academicYearRepository.existsByAnnee(academicYear.getAnnee())) {
            throw new IllegalArgumentException("L'année scolaire " + academicYear.getAnnee() + " existe déjà.");
        }

        // 2. Validation des dates (Cohérence du calendrier)
        if (academicYear.getDateDebut().isAfter(academicYear.getDateFin())) {
            throw new IllegalArgumentException("La date de début ne peut pas être après la date de fin.");
        }

        // 3. Si cette année est définie comme active, on désactive d'abord toutes les autres
        if (academicYear.isActive()) {
            desactiverToutesLesAnnees();
        }

        return academicYearRepository.save(academicYear);
    }

    /**
     * Active manuellement une année scolaire spécifique par son ID.
     */
    @Transactional
    public void activerAnnee(Long id) {
        // Désactivation globale
        desactiverToutesLesAnnees();

        // Activation de l'année cible
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable avec l'ID : " + id));

        year.setActive(true);
        academicYearRepository.save(year);
    }

    /**
     * Désactive le statut 'active' pour toutes les années en base de données.
     * Méthode utilitaire interne pour maintenir l'unicité de l'année en cours.
     */
    private void desactiverToutesLesAnnees() {
        List<AcademicYear> allYears = academicYearRepository.findAll();
        allYears.forEach(y -> y.setActive(false));
        academicYearRepository.saveAll(allYears);
    }

    /**
     * Récupère l'année scolaire actuellement active.
     * MODIFICATION : Ne lance plus d'exception pour éviter de bloquer le frontend.
     */
    public AcademicYear getAnneeActive() {
        return academicYearRepository.findByActiveTrue().orElse(null);
    }

    /**
     * Liste toutes les années scolaires enregistrées.
     */
    public List<AcademicYear> findAll() {
        return academicYearRepository.findAll();
    }

    /**
     * Supprime une année scolaire.
     */
    @Transactional
    public void delete(Long id) {
        academicYearRepository.deleteById(id);
    }
}
