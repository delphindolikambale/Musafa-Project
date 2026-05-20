package com.school.management.repository.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student,Long>{
    boolean existsByPermanentNumber(String permanentNumber);

    // Ajout pour la robustesse
    Optional<Student> findByMatricule(String matricule);

    // Utile pour filtrer les élèves actifs dans le Dashboard
    long countByStatus(StudentStatus status);

    Optional<Student> findByPermanentNumber(String permanentNumber);

    @Query("SELECT DISTINCT s FROM Student s " +
            "JOIN StudentFinancialAccount sfa ON sfa.student = s " +
            "JOIN StudentAnnualFinancialProfile safp ON safp.financialAccount = sfa " +
            "WHERE (" +
            "LOWER(CONCAT(s.lastName, ' ', s.postName, ' ', s.firstName)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.matricule) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.permanentNumber) LIKE LOWER(CONCAT('%', :q, '%'))" +
            ") AND s.status = :status")
    List<Student> searchStudentsWithAccount(@Param("q") String q, @Param("status") StudentStatus status);
}
