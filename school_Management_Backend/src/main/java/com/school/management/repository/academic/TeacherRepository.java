package com.school.management.repository.academic;

import com.school.management.model.academic.Teacher;
import io.micrometer.observation.ObservationFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    // Recherche globale par matricule
    Optional<Teacher> findBySchoolRegistrationNumber(String registrationNumber);

    // ✅ ADAPTATION MULTI-TENANT : Recherche par matricule au sein d'une école spécifique
    Optional<Teacher> findBySchoolRegistrationNumberAndSchoolId(String registrationNumber, Long schoolId);

    // Vérification globale d'existence
    boolean existsBySchoolRegistrationNumber(String registrationNumber);

    // ✅ ADAPTATION MULTI-TENANT : Vérification d'existence au sein d'une école spécifique
    boolean existsBySchoolRegistrationNumberAndSchoolId(String registrationNumber, Long schoolId);

    // Liste globale
    List<Teacher> findAllByOrderByIdDesc();

    // ✅ ADAPTATION MULTI-TENANT : Liste inversée filtrée par école
    List<Teacher> findAllBySchoolIdOrderByIdDesc(Long schoolId);

    // Recherche globale des enseignants actifs uniquement
    List<Teacher> findAllByActiveTrue();

    // ✅ ADAPTATION MULTI-TENANT : Recherche des enseignants actifs d'une école spécifique
    List<Teacher> findAllByActiveTrueAndSchoolId(Long schoolId);

    // Recherche globale par spécialité
    List<Teacher> findByDomainSpecialityId(Long specialityId);

    // ✅ ADAPTATION MULTI-TENANT : Recherche par spécialité et par école
    List<Teacher> findByDomainSpecialityIdAndSchoolId(Long specialityId, Long schoolId);

    // ✅ ADAPTATION MULTI-TENANT : Requête personnalisée sécurisée par l'ID de l'école
    @Query("SELECT t FROM Teacher t WHERE t.school.id = :schoolId AND (" +
            "LOWER(t.schoolRegistrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Teacher> searchTeachers(@Param("query") String query, @Param("schoolId") Long schoolId);

    // Recherche globale par compte utilisateur
    Optional<Teacher> findByUserId(Long userId);

    // ✅ ADAPTATION MULTI-TENANT : Recherche croisée par ID utilisateur et ID école pour la sécurité des sessions
    @Query("SELECT t FROM Teacher t WHERE t.user.id = :userId AND t.school.id = :schoolId")
    Optional<Teacher> findByUserIdAndSchoolId(@Param("userId") Long userId, @Param("schoolId") Long schoolId);
}