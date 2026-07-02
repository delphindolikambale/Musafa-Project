package com.school.management.service.financial;

import com.school.management.dto.financial.TransactionHistoryDTO;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionHistoryService {

    // ✅ Signature mise en conformité avec l'isolation multi-tenant
    List<TransactionHistoryDTO> getAllHistory(Long schoolId);
    List<TransactionHistoryDTO> getHistoryByType(String type, Long schoolId);
    List<TransactionHistoryDTO> getTodayHistory(Long schoolId);
    void logTransaction(String type, String label, BigDecimal amount, String currency, String ref, String user, Long sourceId, Long schoolId);
    void deleteHistory(Long id, Long schoolId);
}