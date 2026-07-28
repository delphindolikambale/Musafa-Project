package com.school.management.repository.academic;

import com.school.management.model.academic.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findBySchoolRegistrationNumber(String registrationNumber);
    Optional<Teacher> findBySchoolRegistrationNumberAndSchoolId(String registrationNumber, Long schoolId);
    boolean existsBySchoolRegistrationNumber(String registrationNumber);
    boolean existsBySchoolRegistrationNumberAndSchoolId(String registrationNumber, Long schoolId);
    List<Teacher> findAllByOrderByIdDesc();
    List<Teacher> findAllBySchoolIdOrderByIdDesc(Long schoolId);
    List<Teacher> findAllByActiveTrue();
    List<Teacher> findAllByActiveTrueAndSchoolId(Long schoolId);
    List<Teacher> findByDomainSpecialityId(Long specialityId);
    List<Teacher> findByDomainSpecialityIdAndSchoolId(Long specialityId, Long schoolId);

    @Query("SELECT t FROM Teacher t WHERE t.school.id = :schoolId AND (" +
            "LOWER(t.schoolRegistrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Teacher> searchTeachers(@Param("query") String query, @Param("schoolId") Long schoolId);

    Optional<Teacher> findByUserId(Long userId);

    @Query("SELECT t FROM Teacher t WHERE t.user.id = :userId AND t.school.id = :schoolId")
    Optional<Teacher> findByUserIdAndSchoolId(@Param("userId") Long userId, @Param("schoolId") Long schoolId);

    long countBySchoolId(Long schoolId);
    long countByGenderIgnoreCaseAndSchoolId(String gender, Long schoolId);

    // ✅ NOUVEAU : Récupération des 5 derniers enseignants enregistrés dans l'établissement
    List<Teacher> findTop5BySchoolIdOrderByIdDesc(Long schoolId);
}