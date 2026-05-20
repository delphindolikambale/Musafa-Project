package com.school.management.repository.financial;

import com.school.management.model.financial.StudentPaymentBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CashReceiptRepository extends JpaRepository<StudentPaymentBreakdown, Long>{
    /**
     * Récupère TOUTES les perceptions depuis le début pour le calcul des ratios.
     */
    @Query("SELECT b.feesGroup.id, b.feesItemName, SUM(b.amount), b.currency, b.payment.annualProfile.enrollment.classroom.id " +
            "FROM StudentPaymentBreakdown b " +
            "WHERE b.payment.paymentDate <= :endDate " +
            "AND b.feesGroup.academicYear.active = true " +
            "GROUP BY b.feesGroup.id, b.feesItemName, b.currency, b.payment.annualProfile.enrollment.classroom.id")
    List<Object[]> getCumulativeReceiptsUntil(@Param("endDate") LocalDateTime endDate);

    /**
     * Récupère les perceptions UNIQUEMENT pour la période sélectionnée (pour le flux dynamique).
     */
    @Query("SELECT b.feesGroup.id, b.feesGroup.type, b.feesItemName, SUM(b.amount), b.feesGroup.academicYear.annee, b.currency " +
            "FROM StudentPaymentBreakdown b " +
            "WHERE b.payment.paymentDate BETWEEN :startDate AND :endDate " +
            "AND (:classroomId IS NULL OR b.payment.annualProfile.enrollment.classroom.id = :classroomId) " +
            "GROUP BY b.feesGroup.id, b.feesGroup.type, b.feesItemName, b.feesGroup.academicYear.annee, b.currency")
    List<Object[]> getFlowReceiptsForPeriod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("classroomId") Long classroomId
    );
}
