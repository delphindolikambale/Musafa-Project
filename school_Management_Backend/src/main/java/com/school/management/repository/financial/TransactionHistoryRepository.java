package com.school.management.repository.financial;

import com.school.management.model.financial.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long>{

    // Récupérer tout trié par date décroissante
    List<TransactionHistory> findAllByOrderByTransactionDateDesc();

    // Filtrer par type (IN/OUT)
    List<TransactionHistory> findByTypeOrderByTransactionDateDesc(String type);

    // Filtrer par plage de dates (pour le filtre "Aujourd'hui")
    List<TransactionHistory> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDateTime start, LocalDateTime end);

}
