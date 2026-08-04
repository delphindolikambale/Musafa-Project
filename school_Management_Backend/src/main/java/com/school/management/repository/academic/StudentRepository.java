package com.school.management.repository.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.Gender;
import com.school.management.model.enums.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByPermanentNumber(String permanentNumber);
    Optional<Student> findByMatricule(String matricule);
    Optional<Student> findByUserId(Long userId);
    List<Student> findBySchoolId(Long schoolId);

    // ✅ CORRECTION : Requête personnalisée via l'entité Enrollment pour résoudre PropertyReferenceException.
    // Intégration du filtrage Multi-tenant + Année académique pour éviter de ramener les élèves des années passées.
    @Query("SELECT e.student FROM Enrollment e WHERE e.classroom.id = :classroomId AND e.academicYear.id = :academicYearId AND e.school.id = :schoolId AND e.active = true")
    List<Student> findActiveStudentsByClassroomAndYearAndSchool(
            @Param("classroomId") Long classroomId,
            @Param("academicYearId") Long academicYearId,
            @Param("schoolId") Long schoolId
    );

    long countBySchoolId(Long schoolId);

    // ✅ NOUVEAU : Comptage par genre pour les statistiques du tableau de bord
    long countByGenderAndSchoolId(Gender gender, Long schoolId);

    @Query("SELECT COUNT(s) > 0 FROM Student s WHERE s.permanentNumber = :permanentNumber AND s.school.id = :schoolId")
    boolean existsByPermanentNumberAndSchoolId(@Param("permanentNumber") String permanentNumber, @Param("schoolId") Long schoolId);

    @Query("SELECT s FROM Student s WHERE s.id = :id AND s.school.id = :schoolId")
    Optional<Student> findByIdAndSchoolId(@Param("id") Long id, @Param("schoolId") Long schoolId);

    @Query("SELECT s FROM Student s WHERE s.matricule = :matricule AND s.school.id = :schoolId")
    Optional<Student> findByMatriculeAndSchoolId(@Param("matricule") String matricule, @Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.status = :status AND s.school.id = :schoolId")
    long countByStatusAndSchoolId(@Param("status") StudentStatus status, @Param("schoolId") Long schoolId);

    @Query("SELECT s FROM Student s WHERE s.permanentNumber = :permanentNumber AND s.school.id = :schoolId")
    Optional<Student> findByPermanentNumberAndSchoolId(@Param("permanentNumber") String permanentNumber, @Param("schoolId") Long schoolId);

    @Query("SELECT DISTINCT s FROM Student s " +
            "JOIN StudentFinancialAccount sfa ON sfa.student = s " +
            "JOIN StudentAnnualFinancialProfile safp ON safp.financialAccount = sfa " +
            "WHERE s.school.id = :schoolId AND (" +
            "LOWER(CONCAT(s.lastName, ' ', s.postName, ' ', s.firstName)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.matricule) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.permanentNumber) LIKE LOWER(CONCAT('%', :q, '%'))" +
            ") AND s.status = :status")
    List<Student> searchStudentsWithAccountMultiTenant(@Param("q") String q, @Param("status") StudentStatus status, @Param("schoolId") Long schoolId);

    @Query("SELECT s FROM Student s WHERE s.user.id = :userId AND s.school.id = :schoolId")
    Optional<Student> findByUserIdAndSchoolId(@Param("userId") Long userId, @Param("schoolId") Long schoolId);
}