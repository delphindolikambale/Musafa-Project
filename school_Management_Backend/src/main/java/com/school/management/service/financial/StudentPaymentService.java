package com.school.management.service.financial;

import com.school.management.dto.financial.DailyCashierReportDTO;
import com.school.management.dto.financial.StudentFinancialSummaryDTO;
import com.school.management.dto.financial.StudentPaymentCreateDTO;
import com.school.management.dto.financial.StudentPaymentResponseDTO;

import java.util.List;

public interface StudentPaymentService {

    StudentPaymentResponseDTO pay(StudentPaymentCreateDTO dto, Long schoolId);
    StudentFinancialSummaryDTO getAccountSummary(String accountNumber, Long schoolId);

    // Rapport pour le Dashboard
    DailyCashierReportDTO getDailyReport(Long schoolId);

    StudentPaymentResponseDTO getById(Long id, Long schoolId);
    StudentPaymentResponseDTO getByReceiptNumber(String receiptNumber, Long schoolId);
    List<StudentPaymentResponseDTO> getByAnnualProfile(Long annualProfileId, Long schoolId);
    List<StudentPaymentResponseDTO> getAll(Long schoolId);
    boolean existsByAccountNumber(String accountNumber, Long schoolId);
    List<StudentPaymentResponseDTO> getByAccountNumber(String accountNumber, Long schoolId);
}