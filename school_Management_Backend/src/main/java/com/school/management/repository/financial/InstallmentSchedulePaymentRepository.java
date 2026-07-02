package com.school.management.repository.financial;

import com.school.management.model.financial.InstallmentSchedulePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InstallmentSchedulePaymentRepository extends JpaRepository<InstallmentSchedulePayment, Long>{

    Optional<InstallmentSchedulePayment> findByIdAndSchoolId(Long id, Long schoolId);

    List<InstallmentSchedulePayment> findByStudentPaymentIdAndSchoolId(Long studentPaymentId, Long schoolId);

    List<InstallmentSchedulePayment> findByInstallmentScheduleIdAndSchoolId(Long installmentScheduleId, Long schoolId);

    List<InstallmentSchedulePayment> findBySchoolId(Long schoolId);

    // ✅ OPTIMISÉ MULTI-TENANT : Agrégation sécurisée par élève et verrouillée au périmètre de l'école
    @Query("""
        SELECT COALESCE(SUM(isp.amountApplied), 0)
        FROM InstallmentSchedulePayment isp
        WHERE isp.installmentSchedule.id = :installmentId
        AND isp.studentPayment.annualProfile.id = :profileId
        AND isp.school.id = :schoolId
    """)
    BigDecimal sumAmountAppliedByInstallmentAndProfileAndSchoolId(
            @Param("installmentId") Long installmentId,
            @Param("profileId") Long profileId,
            @Param("schoolId") Long schoolId
    );
}