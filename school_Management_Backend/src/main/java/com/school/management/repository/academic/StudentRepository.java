package com.school.management.repository.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    // Permet la vérification globale (utile pour les initialisations ou unicité nationale)
    boolean existsByPermanentNumber(String permanentNumber);

    // Permet de récupérer un étudiant globalement par son matricule (indispensable pour le service d'archive)
    Optional<Student> findByMatricule(String matricule);

    // ✅ FIX CORRECTION : Recherche globale par ID utilisateur (indispensable pour le chargement initial d'un compte non encore lié à une école)
    Optional<Student> findByUserId(Long userId);

    // ✅ NOUVEAU & SÉCURISÉ : Récupère uniquement les élèves rattachés à une école spécifique
    List<Student> findBySchoolId(Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Ajout du prototype de comptage automatique par établissement
    long countBySchoolId(Long schoolId);

    // ✅ OPTIMISÉ : Filtrage direct par la propriété school de l'élève
    @Query("SELECT COUNT(s) > 0 FROM Student s WHERE s.permanentNumber = :permanentNumber AND s.school.id = :schoolId")
    boolean existsByPermanentNumberAndSchoolId(@Param("permanentNumber") String permanentNumber, @Param("schoolId") Long schoolId);

    // ✅ OPTIMISÉ : Recherche par ID de l'élève et ID de l'école directe
    @Query("SELECT s FROM Student s WHERE s.id = :id AND s.school.id = :schoolId")
    Optional<Student> findByIdAndSchoolId(@Param("id") Long id, @Param("schoolId") Long schoolId);

    // ✅ OPTIMISÉ : Recherche par Matricule et ID de l'école directe
    @Query("SELECT s FROM Student s WHERE s.matricule = :matricule AND s.school.id = :schoolId")
    Optional<Student> findByMatriculeAndSchoolId(@Param("matricule") String matricule, @Param("schoolId") Long schoolId);

    // ✅ OPTIMISÉ : Comptage des élèves par statut et par école directe
    @Query("SELECT COUNT(s) FROM Student s WHERE s.status = :status AND s.school.id = :schoolId")
    long countByStatusAndSchoolId(@Param("status") StudentStatus status, @Param("schoolId") Long schoolId);

    // ✅ OPTIMISÉ : Recherche par numéro permanent et par école directe
    @Query("SELECT s FROM Student s WHERE s.permanentNumber = :permanentNumber AND s.school.id = :schoolId")
    Optional<Student> findByPermanentNumberAndSchoolId(@Param("permanentNumber") String permanentNumber, @Param("schoolId") Long schoolId);

    // ✅ OPTIMISÉ : Nettoyage de la clause WHERE pour cibler s.school.id directement
    @Query("SELECT DISTINCT s FROM Student s " +
            "JOIN StudentFinancialAccount sfa ON sfa.student = s " +
            "JOIN StudentAnnualFinancialProfile safp ON safp.financialAccount = sfa " +
            "WHERE s.school.id = :schoolId AND (" +
            "LOWER(CONCAT(s.lastName, ' ', s.postName, ' ', s.firstName)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.matricule) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.permanentNumber) LIKE LOWER(CONCAT('%', :q, '%'))" +
            ") AND s.status = :status")
    List<Student> searchStudentsWithAccountMultiTenant(@Param("q") String q, @Param("status") StudentStatus status, @Param("schoolId") Long schoolId);

    // ✅ FILTRAGE MIXTE SÉCURISÉ : Permet de trouver l'étudiant via son compte utilisateur tout en validant le scope de l'école
    @Query("SELECT s FROM Student s WHERE s.user.id = :userId AND s.school.id = :schoolId")
    Optional<Student> findByUserIdAndSchoolId(@Param("userId") Long userId, @Param("schoolId") Long schoolId);
}