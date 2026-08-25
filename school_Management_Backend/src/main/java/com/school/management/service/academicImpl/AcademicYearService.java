package com.school.management.service.academicImpl;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service métier pour la gestion des années scolaires.
 * Gère le calendrier académique et applique l'isolation des données par école.
 */
@Service
@RequiredArgsConstructor
public class AcademicYearService {
    private final AcademicYearRepository academicYearRepository;

    /**
     * Créer ou mettre à jour une année scolaire pour une école précise.
     * Inclut la logique pour garantir qu'une seule année est active à la fois par établissement.
     */
    @Transactional
    public AcademicYear save(AcademicYear academicYear, Long schoolId) {
        if (schoolId == null) {
            throw new IllegalArgumentException("Le contexte de l'établissement scolaire est manquant.");
        }

        // Associer obligatoirement l'école courante à l'entité avant la sauvegarde via un objet School typé contenant l'ID
        academicYear.setSchool(School.builder().id(schoolId).build());

        // 1. Vérifier si l'année existe déjà (uniquement pour l'école concernée)
        // La vérification sécurise à la fois la création (POST) et la modification (PUT)
        Optional<AcademicYear> existingYear = academicYearRepository.findByAnneeAndSchoolId(academicYear.getAnnee(), schoolId);
        if (existingYear.isPresent() && !existingYear.get().getId().equals(academicYear.getId())) {
            throw new IllegalArgumentException("L'année scolaire " + academicYear.getAnnee() + " existe déjà dans votre établissement.");
        }

        // 2. Validation des dates (Cohérence du calendrier)
        if (academicYear.getDateDebut().isAfter(academicYear.getDateFin())) {
            throw new IllegalArgumentException("La date de début ne peut pas être après la date de fin.");
        }

        // 3. Si cette année est définie comme active, on désactive d'abord toutes les autres de CETTE école
        if (academicYear.isActive()) {
            desactiverToutesLesAnnees(schoolId);
        }

        return academicYearRepository.save(academicYear);
    }

    /**
     * Active manuellement une année scolaire spécifique appartenant à l'école.
     */
    @Transactional
    public void activerAnnee(Long id, Long schoolId) {
        // Désactivation au sein de cette école uniquement
        desactiverToutesLesAnnees(schoolId);

        // Récupération sécurisée de l'année cible
        AcademicYear year = academicYearRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable ou accès non autorisé pour cet établissement."));

        year.setActive(true);
        academicYearRepository.save(year);
    }

    /**
     * Désactive le statut 'active' pour toutes les années de l'école courante en base de données.
     */
    private void desactiverToutesLesAnnees(Long schoolId) {
        List<AcademicYear> schoolYears = academicYearRepository.findAllBySchoolId(schoolId);
        schoolYears.forEach(y -> y.setActive(false));
        academicYearRepository.saveAll(schoolYears);
    }

    /**
     * Récupère l'année scolaire actuellement active pour l'école connectée.
     */
    public AcademicYear getAnneeActive(Long schoolId) {
        return academicYearRepository.findByActiveTrueAndSchoolId(schoolId).orElse(null);
    }

    /**
     * Liste toutes les années scolaires enregistrées de l'école connectée.
     */
    public List<AcademicYear> findAll(Long schoolId) {
        return academicYearRepository.findAllBySchoolId(schoolId);
    }

    /**
     * Supprime une année scolaire en validant l'appartenance à l'école.
     */
    @Transactional
    public void delete(Long id, Long schoolId) {
        AcademicYear year = academicYearRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Année académique introuvable ou privilèges de suppression insuffisants."));
        academicYearRepository.delete(year);
    }
}