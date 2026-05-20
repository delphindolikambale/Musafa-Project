package com.school.management.repository.financial;

import com.school.management.model.financial.StudentAnnualFinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentAnnualFinancialProfileRepository extends JpaRepository<StudentAnnualFinancialProfile, Long>{

    /**
     * Utilisé pour vérifier l'unicité avant création
     */
    Optional<StudentAnnualFinancialProfile>
    findByFinancialAccountIdAndAcademicYearId(Long accountId, Long academicYearId);

    /**
     * Recherche par numéro de compte (numéro permanent de l'élève)
     */
    List<StudentAnnualFinancialProfile>
    findByFinancialAccount_AccountNumber(String accountNumber);

    /**
     * Recherche tous les profils pour une année académique spécifique.
     * Utile pour les rapports financiers globaux de l'année.
     */
    List<StudentAnnualFinancialProfile> findByAcademicYearId(Long academicYearId);

    /**
     * Recherche par ID d'inscription (Enrollment).
     * Utile pour retrouver le profil financier d'un élève précis dans une classe.
     */
    Optional<StudentAnnualFinancialProfile> findByEnrollmentId(Long enrollmentId);

    /**
     * Recherche tous les élèves liés à une grille tarifaire spécifique.
     */
    List<StudentAnnualFinancialProfile> findByScheduleFeesId(Long scheduleFeesId);

    /**
     * ✅ NOUVEAU : Recherche tous les profils financiers des élèves d'une classe spécifique.
     * Utilisé pour le recouvrement par classe.
     */
    List<StudentAnnualFinancialProfile> findByEnrollment_Classroom_Id(Long classroomId);

    /**
     * Liste les profils actifs ou clôturés
     */
    List<StudentAnnualFinancialProfile> findByActiveTrue();
}
