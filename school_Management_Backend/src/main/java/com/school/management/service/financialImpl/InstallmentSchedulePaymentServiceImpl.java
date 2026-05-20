package com.school.management.service.financialImpl;

import com.school.management.dto.financial.InstallmentSchedulePaymentResponseDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.financial.InstallmentSchedulePayment;
import com.school.management.repository.financial.InstallmentSchedulePaymentRepository;
import com.school.management.service.financial.InstallmentSchedulePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)

public class InstallmentSchedulePaymentServiceImpl implements InstallmentSchedulePaymentService{

    private final InstallmentSchedulePaymentRepository repository;

    @Override
    public List<InstallmentSchedulePaymentResponseDTO> getAll() {
        return repository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public InstallmentSchedulePaymentResponseDTO getById(Long id) {
        return repository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Application de paiement introuvable"));
    }

    @Override
    public List<InstallmentSchedulePaymentResponseDTO> getByStudentPayment(Long studentPaymentId) {
        return repository.findByStudentPaymentId(studentPaymentId).stream().map(this::mapToDTO).toList();
    }

    @Override
    public List<InstallmentSchedulePaymentResponseDTO> getByInstallmentSchedule(Long installmentScheduleId) {
        return repository.findByInstallmentScheduleId(installmentScheduleId).stream().map(this::mapToDTO).toList();
    }

    private InstallmentSchedulePaymentResponseDTO mapToDTO(InstallmentSchedulePayment entity) {
        return InstallmentSchedulePaymentResponseDTO.builder()
                .id(entity.getId())
                .installmentScheduleId(entity.getInstallmentSchedule().getId())
                .installmentNumber(entity.getInstallmentNumber())
                .studentPaymentId(entity.getStudentPayment().getId())
                .receiptNumber(entity.getStudentPayment().getReceiptNumber())
                .amountApplied(entity.getAmountApplied())
                .fullyPaid(entity.isFullyPaid())
                .appliedAt(entity.getAppliedAt())
                .build();
    }
}
