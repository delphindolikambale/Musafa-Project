package com.school.management.service.financialImpl;

import com.school.management.dto.financial.StudentPaymentBreakdownResponseDTO;
import com.school.management.model.financial.StudentPaymentBreakdown;
import com.school.management.repository.financial.StudentPaymentBreakdownRepository;
import com.school.management.service.financial.StudentPaymentBreakdownService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)

public class StudentPaymentBreakdownServiceImpl implements StudentPaymentBreakdownService {

    private final StudentPaymentBreakdownRepository repository;

    @Override
    public List<StudentPaymentBreakdownResponseDTO> getByPaymentId(Long paymentId) {
        return repository.findByPaymentId(paymentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private StudentPaymentBreakdownResponseDTO mapToDTO(StudentPaymentBreakdown entity) {
        return StudentPaymentBreakdownResponseDTO.builder()
                .id(entity.getId())
                .feesGroupId(entity.getFeesGroup() != null ? entity.getFeesGroup().getId() : null)
                .feesGroupName(entity.getFeesGroupName())
                .feesItemId(entity.getFeesItem() != null ? entity.getFeesItem().getId() : null)
                .feesItemName(entity.getFeesItemName())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .appliedPercentage(entity.getAppliedPercentage())
                .build();
    }
}
