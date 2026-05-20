package com.school.management.repository.financial;

import com.school.management.model.financial.StudentFinancialAccount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface StudentFinancialAccountRepository extends JpaRepository<StudentFinancialAccount, Long>{

    /**
     * Recherche le compte par l'ID technique de l'élève
     */
    Optional<StudentFinancialAccount> findByStudentId(Long studentId);

    /**
     * Recherche par le numéro de compte généré (Matricule + NumPermanent)
     * Cette méthode sera la clé pour votre recherche initiale côté React.
     */
    Optional<StudentFinancialAccount> findByAccountNumber(String accountNumber);

    /**
     * Recherche avancée : Récupère le compte et ses profils annuels en une seule fois.
     * Utile pour le Frontend pour identifier immédiatement le profil de l'année en cours.
     */
    @EntityGraph(attributePaths = {"annualProfiles", "student"})
    Optional<StudentFinancialAccount> findWithProfilesByAccountNumber(String accountNumber);

    /**
     * Recherche par nom de l'élève (insensible à la casse) pour le dashboard caissier
     */
    List<StudentFinancialAccount> findByStudent_LastNameContainingIgnoreCase(String lastName);

    /**
     * Recherche par numéro permanent (partiel ou complet)
     */
    List<StudentFinancialAccount> findByStudent_PermanentNumberContaining(String permanentNumber);

    Optional<StudentFinancialAccount> findByStudent_Matricule(String matricule);
}
