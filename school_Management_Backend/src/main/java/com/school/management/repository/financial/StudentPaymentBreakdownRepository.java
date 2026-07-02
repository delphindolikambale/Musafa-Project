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

    @Query("SELECT b FROM StudentPaymentBreakdown b WHERE b.payment.id = :paymentId AND b.payment.school.id = :schoolId")
    List<StudentPaymentBreakdown> findByPaymentIdAndSchoolId(@Param("paymentId") Long paymentId, @Param("schoolId") Long schoolId);

    @Query("SELECT b FROM StudentPaymentBreakdown b WHERE b.payment.annualProfile.id = :profileId AND b.payment.school.id = :schoolId")
    List<StudentPaymentBreakdown> findByPayment_AnnualProfile_IdAndSchoolId(@Param("profileId") Long profileId, @Param("schoolId") Long schoolId);

    /**
     * Calcule la somme ventilée par nom de groupe et par plage de dates pour une école spécifique.
     */
    @Query("SELECT SUM(b.amount) FROM StudentPaymentBreakdown b " +
            "WHERE b.feesGroupName = :groupName " +
            "AND b.payment.paymentDate BETWEEN :start AND :end " +
            "AND b.payment.school.id = :schoolId")
    BigDecimal sumByGroupNameAndDateAndSchoolId(@Param("groupName") String groupName,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end,
                                                @Param("schoolId") Long schoolId);

    /**
     * Calcule la somme ventilée par nom de groupe, par devise précise,
     * par plage de dates et restreinte à une seule école.
     */
    @Query("SELECT SUM(b.amount) FROM StudentPaymentBreakdown b " +
            "WHERE b.feesGroupName = :groupName " +
            "AND b.currency = :currency " +
            "AND b.payment.paymentDate BETWEEN :start AND :end " +
            "AND b.payment.school.id = :schoolId")
    BigDecimal sumByGroupNameAndCurrencyAndDateAndSchoolId(@Param("groupName") String groupName,
                                                           @Param("currency") Currency currency,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end,
                                                           @Param("schoolId") Long schoolId);
}