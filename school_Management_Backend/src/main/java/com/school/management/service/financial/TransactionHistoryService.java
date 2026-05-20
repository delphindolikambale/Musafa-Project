package com.school.management.service.financial;

import com.school.management.dto.financial.TransactionHistoryDTO;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionHistoryService {

    List<TransactionHistoryDTO> getAllHistory();
    List<TransactionHistoryDTO> getHistoryByType(String type);
    List<TransactionHistoryDTO> getTodayHistory(); // Nouveau
    void logTransaction(String type, String label, BigDecimal amount, String currency, String ref, String user, Long sourceId);
    void deleteHistory(Long id); // Nouveau
}
