package com.school.management.repository.financial;


import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.financial.StudentPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudentPaymentRepository extends JpaRepository<StudentPayment, Long> {
    Optional<StudentPayment> findByReceiptNumber(String receiptNumber);
    List<StudentPayment> findByAnnualProfileId(Long annualProfileId);

    // Pour le rapport journalier
    List<StudentPayment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(p) FROM StudentPayment p WHERE p.paymentDate BETWEEN :start AND :end")
    long countPaymentsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // NOUVEAU : Pour compter les reçus du mois en cours avec le préfixe donné
    long countByReceiptNumberStartingWith(String prefix);
}
