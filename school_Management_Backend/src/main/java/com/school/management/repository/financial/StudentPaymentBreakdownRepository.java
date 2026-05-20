package com.school.management.repository.financial;

import com.school.management.model.enums.Currency;
import com.school.management.model.financial.StudentPaymentBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository

public interface StudentPaymentBreakdownRepository extends JpaRepository<StudentPaymentBreakdown, Long> {
    List<StudentPaymentBreakdown> findByPaymentId(Long paymentId);

    List<StudentPaymentBreakdown> findByPayment_AnnualProfile_Id(Long profileId);

    /**
     * Calcule la somme ventilée par nom de groupe et par plage de dates (Toutes devises confondues).
     * Conservée pour ne pas casser la logique existante.
     */
    @Query("SELECT SUM(b.amount) FROM StudentPaymentBreakdown b " +
            "WHERE b.feesGroupName = :groupName " +
            "AND b.payment.paymentDate BETWEEN :start AND :end")
    BigDecimal sumByGroupNameAndDate(@Param("groupName") String groupName,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    /**
     * NOUVELLE MÉTHODE : Calcule la somme ventilée par nom de groupe, par devise précise
     * et par plage de dates. Utilisée pour le Daily Cashier Report multidevise.
     */
    @Query("SELECT SUM(b.amount) FROM StudentPaymentBreakdown b " +
            "WHERE b.feesGroupName = :groupName " +
            "AND b.currency = :currency " +
            "AND b.payment.paymentDate BETWEEN :start AND :end")
    BigDecimal sumByGroupNameAndCurrencyAndDate(@Param("groupName") String groupName,
                                                @Param("currency") Currency currency,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);
}

