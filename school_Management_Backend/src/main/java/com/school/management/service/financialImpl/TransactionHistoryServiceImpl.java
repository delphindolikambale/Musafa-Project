package com.school.management.service.financialImpl;

import com.school.management.dto.financial.TransactionHistoryDTO;
import com.school.management.model.financial.TransactionHistory;
import com.school.management.model.multitenant.School;
import com.school.management.repository.financial.TransactionHistoryRepository;
import com.school.management.service.financial.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionHistoryServiceImpl implements TransactionHistoryService {

    private final TransactionHistoryRepository repository;

    @Override
    public List<TransactionHistoryDTO> getAllHistory(Long schoolId) {
        return repository.findAllBySchoolIdOrderByTransactionDateDesc(schoolId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryDTO> getHistoryByType(String type, Long schoolId) {
        return repository.findByTypeAndSchoolIdOrderByTransactionDateDesc(type, schoolId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryDTO> getTodayHistory(Long schoolId) {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        return repository.findByTransactionDateBetweenAndSchoolIdOrderByTransactionDateDesc(start, end, schoolId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteHistory(Long id, Long schoolId) {
        // ✅ Sécurité de suppression inter-tenant
        TransactionHistory tx = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historique introuvable"));

        if (tx.getSchool() != null && tx.getSchool().getId().equals(schoolId)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("Action interdite : Cet historique n'appartient pas à votre établissement.");
        }
    }

    @Override
    public void logTransaction(String type, String label, BigDecimal amount, String currency, String ref, String user, Long sourceId, Long schoolId) {
        TransactionHistory tx = TransactionHistory.builder()
                .type(type)
                .label(label)
                .amount(amount)
                .currency(currency)
                .transactionDate(LocalDateTime.now())
                .referenceNumber(ref)
                .performedBy(user)
                .sourceId(sourceId)
                .school(School.builder().id(schoolId).build()) // ✅ Renseignement automatique du tenant lors du log
                .build();
        repository.save(tx);
    }

    private TransactionHistoryDTO mapToDTO(TransactionHistory entity) {
        TransactionHistoryDTO dto = new TransactionHistoryDTO();
        dto.setId(entity.getId());
        dto.setSourceId(entity.getSourceId());
        dto.setType(entity.getType());
        dto.setLabel(entity.getLabel());
        dto.setAmount(entity.getAmount());
        dto.setCurrency(entity.getCurrency());
        dto.setTransactionDate(entity.getTransactionDate());
        dto.setReferenceNumber(entity.getReferenceNumber());
        dto.setPerformedBy(entity.getPerformedBy());
        return dto;
    }
}