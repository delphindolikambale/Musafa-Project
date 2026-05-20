package com.school.management.controller.financial;

import com.school.management.dto.financial.TransactionHistoryDTO;
import com.school.management.service.financial.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial/history")
@RequiredArgsConstructor

public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;

    @GetMapping
    public List<TransactionHistoryDTO> getHistory(@RequestParam(required = false) String type) {
        if (type != null) {
            if (type.equalsIgnoreCase("aujourd'hui")) {
                return transactionHistoryService.getTodayHistory();
            } else if (!type.equalsIgnoreCase("tout")) {
                String filterType = type.equalsIgnoreCase("entrées") ? "IN" : "OUT";
                return transactionHistoryService.getHistoryByType(filterType);
            }
        }
        return transactionHistoryService.getAllHistory();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        transactionHistoryService.deleteHistory(id);
        return ResponseEntity.ok().build();
    }
}
