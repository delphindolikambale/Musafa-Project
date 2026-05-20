package com.school.management.controller.financial;

import com.school.management.dto.financial.CashReceiptDashboardDTO;
import com.school.management.service.financial.CashReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/cash-receipts")

public class CashReceiptController {
    @Autowired
    private CashReceiptService cashReceiptService;

    /**
     * Endpoint dynamique pour le flux de trésorerie.
     * @param filter : DAILY, WEEKLY, MONTHLY, ANNUAL
     * @param date : La date de référence
     * @param classroomId : Optionnel pour filtrer par classe
     */
    @GetMapping("/summary")
    public ResponseEntity<CashReceiptDashboardDTO> getCashSummary(
            @RequestParam(defaultValue = "DAILY") String filter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long classroomId) {

        LocalDate queryDate = (date == null) ? LocalDate.now() : date;
        return ResponseEntity.ok(cashReceiptService.getDashboardData(filter, queryDate, classroomId));
    }

}
