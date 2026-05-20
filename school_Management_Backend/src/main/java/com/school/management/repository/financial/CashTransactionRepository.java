package com.school.management.repository.financial;

import com.school.management.model.financial.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository

public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    // Récupération par ordre chronologique (Ancien -> Récent)
    List<CashTransaction> findByAcademicYearIdOrderByTransactionDateAsc(Long academicYearId);

    Optional<CashTransaction> findByTransactionDateAndAcademicYearId(LocalDate date, Long academicYearId);

    @Query("SELECT c FROM CashTransaction c WHERE c.academicYear.id = :yearId AND c.transactionDate < :date ORDER BY c.transactionDate DESC LIMIT 1")
    Optional<CashTransaction> findLastTransactionBefore(LocalDate date, Long yearId);
}