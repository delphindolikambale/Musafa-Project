package com.school.management.repository.financial;

import com.school.management.model.financial.StudentPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudentPaymentRepository extends JpaRepository<StudentPayment, Long> {

    @Query("SELECT p FROM StudentPayment p WHERE p.receiptNumber = :receiptNumber AND p.school.id = :schoolId")
    Optional<StudentPayment> findByReceiptNumberAndSchoolId(@Param("receiptNumber") String receiptNumber, @Param("schoolId") Long schoolId);

    @Query("SELECT p FROM StudentPayment p WHERE p.annualProfile.id = :annualProfileId AND p.school.id = :schoolId")
    List<StudentPayment> findByAnnualProfileIdAndSchoolId(@Param("annualProfileId") Long annualProfileId, @Param("schoolId") Long schoolId);

    @Query("SELECT p FROM StudentPayment p WHERE p.paymentDate BETWEEN :start AND :end AND p.school.id = :schoolId")
    List<StudentPayment> findByPaymentDateBetweenAndSchoolId(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(p) FROM StudentPayment p WHERE p.paymentDate BETWEEN :start AND :end AND p.school.id = :schoolId")
    long countPaymentsBetweenAndSchoolId(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(p) FROM StudentPayment p WHERE p.receiptNumber LIKE CONCAT(:prefix, '%') AND p.school.id = :schoolId")
    long countByReceiptNumberStartingWithAndSchoolId(@Param("prefix") String prefix, @Param("schoolId") Long schoolId);

    @Query("SELECT p FROM StudentPayment p WHERE p.school.id = :schoolId")
    List<StudentPayment> findAllBySchoolId(@Param("schoolId") Long schoolId);
}