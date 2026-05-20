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
    Optional<Teacher> findBySchoolRegistrationNumber(String registrationNumber);
    boolean existsBySchoolRegistrationNumber(String registrationNumber);
    List<Teacher> findAllByOrderByIdDesc();
    // Recherche des enseignants actifs uniquement
    List<Teacher> findAllByActiveTrue();

    // Mise à jour : Recherche par spécialité
    List<Teacher> findByDomainSpecialityId(Long specialityId);

    @Query("SELECT t FROM Teacher t WHERE " +
            "LOWER(t.schoolRegistrationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Teacher> searchTeachers(@Param("query") String query);

    Optional<Teacher> findByUserId(Long userId);
}


