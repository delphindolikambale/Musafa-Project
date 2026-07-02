package com.school.management.service.financial;

import com.school.management.dto.financial.InstallmentSchedulePaymentResponseDTO;

import java.util.List;

public interface InstallmentSchedulePaymentService {

    // ✅ Signatures adaptées pour filtrer hermétiquement les affectations de paiements
    List<InstallmentSchedulePaymentResponseDTO> getAll(Long schoolId);
    InstallmentSchedulePaymentResponseDTO getById(Long id, Long schoolId);
    List<InstallmentSchedulePaymentResponseDTO> getByStudentPayment(Long studentPaymentId, Long schoolId);
    List<InstallmentSchedulePaymentResponseDTO> getByInstallmentSchedule(Long installmentScheduleId, Long schoolId);
}