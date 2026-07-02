package com.school.management.repository.financial;

import com.school.management.model.financial.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long>{

    // ✅ Isolation multi-tenant sur toutes les requêtes de l'historique
    List<TransactionHistory> findAllBySchoolIdOrderByTransactionDateDesc(Long schoolId);

    List<TransactionHistory> findByTypeAndSchoolIdOrderByTransactionDateDesc(String type, Long schoolId);

    List<TransactionHistory> findByTransactionDateBetweenAndSchoolIdOrderByTransactionDateDesc(LocalDateTime start, LocalDateTime end, Long schoolId);
}