package com.school.management.repository.financial;

import com.school.management.model.financial.StudentFinancialAccount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface StudentFinancialAccountRepository extends JpaRepository<StudentFinancialAccount, Long>{

    Optional<StudentFinancialAccount> findByIdAndSchoolId(Long id, Long schoolId);

    Optional<StudentFinancialAccount> findByStudentIdAndSchoolId(Long studentId, Long schoolId);

    Optional<StudentFinancialAccount> findByAccountNumberAndSchoolId(String accountNumber, Long schoolId);

    @EntityGraph(attributePaths = {"annualProfiles", "student"})
    Optional<StudentFinancialAccount> findWithProfilesByAccountNumberAndSchoolId(String accountNumber, Long schoolId);

    List<StudentFinancialAccount> findByStudent_LastNameContainingIgnoreCaseAndSchoolId(String lastName, Long schoolId);

    List<StudentFinancialAccount> findByStudent_PermanentNumberContainingAndSchoolId(String permanentNumber, Long schoolId);

    Optional<StudentFinancialAccount> findByStudent_MatriculeAndSchoolId(String matricule, Long schoolId);

    List<StudentFinancialAccount> findBySchoolId(Long schoolId);
}