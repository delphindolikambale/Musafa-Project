package com.school.management.service.financial;

import com.school.management.dto.financial.InstallmentSchedulePaymentResponseDTO;
import com.school.management.model.financial.ScheduleFees;

import java.math.BigDecimal;
import java.util.List;

public interface InstallmentSchedulePaymentService {

    List<InstallmentSchedulePaymentResponseDTO> getAll();
    InstallmentSchedulePaymentResponseDTO getById(Long id);
    List<InstallmentSchedulePaymentResponseDTO> getByStudentPayment(Long studentPaymentId);
    List<InstallmentSchedulePaymentResponseDTO> getByInstallmentSchedule(Long installmentScheduleId);

}
