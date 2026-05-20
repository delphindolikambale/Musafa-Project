package com.school.management.repository.financial;

import com.school.management.model.financial.InstallmentSchedulePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface InstallmentSchedulePaymentRepository extends JpaRepository<InstallmentSchedulePayment, Long>{

    List<InstallmentSchedulePayment> findByStudentPaymentId(Long studentPaymentId);

    List<InstallmentSchedulePayment> findByInstallmentScheduleId(Long installmentScheduleId);

    /**
     * ✅ LA MÉTHODE LA PLUS IMPORTANTE : Isolation par élève.
     * Calcule le montant déjà payé par UN ÉLÈVE précis pour UNE TRANCHE précise.
     * Empêche de mélanger les paiements des différents élèves.
     */
    @Query("""
        SELECT COALESCE(SUM(isp.amountApplied), 0)
        FROM InstallmentSchedulePayment isp
        WHERE isp.installmentSchedule.id = :installmentId
        AND isp.studentPayment.annualProfile.id = :profileId
    """)
    BigDecimal sumAmountAppliedByInstallmentAndProfile(
            @Param("installmentId") Long installmentId,
            @Param("profileId") Long profileId
    );
}
