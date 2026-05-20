package com.school.management.service.financial;

import com.school.management.dto.financial.DailyCashierReportDTO;
import com.school.management.dto.financial.StudentFinancialSummaryDTO;
import com.school.management.dto.financial.StudentPaymentCreateDTO;
import com.school.management.dto.financial.StudentPaymentResponseDTO;

import java.util.List;

public interface StudentPaymentService {

    StudentPaymentResponseDTO pay(StudentPaymentCreateDTO dto);
    StudentFinancialSummaryDTO getAccountSummary(String accountNumber);

    // Rapport pour le Dashboard
    DailyCashierReportDTO getDailyReport();

    StudentPaymentResponseDTO getById(Long id);
    StudentPaymentResponseDTO getByReceiptNumber(String receiptNumber);
    List<StudentPaymentResponseDTO> getByAnnualProfile(Long annualProfileId);
    List<StudentPaymentResponseDTO> getAll();
    boolean existsByAccountNumber(String accountNumber);
    List<StudentPaymentResponseDTO> getByAccountNumber(String accountNumber);
}
