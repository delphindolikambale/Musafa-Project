package com.school.management.repository.financial;

import com.school.management.model.financial.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {

    // ✅ Isolation multi-tenant ajoutée
    List<CashTransaction> findByAcademicYearIdAndSchoolIdOrderByTransactionDateAsc(Long academicYearId, Long schoolId);

    // ✅ Isolation multi-tenant ajoutée
    Optional<CashTransaction> findByTransactionDateAndAcademicYearIdAndSchoolId(LocalDate date, Long academicYearId, Long schoolId);

    // ✅ Requête JPQL adaptée pour filtrer par schoolId
    @Query("SELECT c FROM CashTransaction c WHERE c.school.id = :schoolId AND c.academicYear.id = :yearId AND c.transactionDate < :date ORDER BY c.transactionDate DESC LIMIT 1")
    Optional<CashTransaction> findLastTransactionBefore(@Param("date") LocalDate date, @Param("yearId") Long yearId, @Param("schoolId") Long schoolId);
}