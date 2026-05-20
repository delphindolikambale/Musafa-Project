package com.school.management.service.financialImpl;

import com.school.management.dto.financial.TransactionHistoryDTO;
import com.school.management.model.financial.TransactionHistory;
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
    public List<TransactionHistoryDTO> getAllHistory() {
        return repository.findAllByOrderByTransactionDateDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryDTO> getHistoryByType(String type) {
        return repository.findByTypeOrderByTransactionDateDesc(type)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TransactionHistoryDTO> getTodayHistory() {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        return repository.findByTransactionDateBetweenOrderByTransactionDateDesc(start, end)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteHistory(Long id) {
        repository.deleteById(id);
    }

    @Override
    public void logTransaction(String type, String label, BigDecimal amount, String currency, String ref, String user, Long sourceId) {
        TransactionHistory tx = TransactionHistory.builder()
                .type(type)
                .label(label)
                .amount(amount)
                .currency(currency)
                .transactionDate(LocalDateTime.now())
                .referenceNumber(ref)
                .performedBy(user)
                .sourceId(sourceId)
                .build();
        repository.save(tx);
    }

    private TransactionHistoryDTO mapToDTO(TransactionHistory entity) {
        TransactionHistoryDTO dto = new TransactionHistoryDTO();

        // ID technique de la ligne d'historique (utilisé par le bouton supprimer du front)
        dto.setId(entity.getId());

        // ID de la source originale (utilisé par le bouton reçu du front)
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
