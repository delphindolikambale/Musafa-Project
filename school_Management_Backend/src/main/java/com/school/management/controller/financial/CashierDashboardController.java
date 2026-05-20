package com.school.management.controller.financial;

import com.school.management.dto.financial.CashierDashboardDTO;
import com.school.management.service.financial.CashierDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor

public class CashierDashboardController {

    private final CashierDashboardService dashboardService;

    @GetMapping("/cashier-stats")
    public ResponseEntity<CashierDashboardDTO> getStats(@RequestParam Long academicYearId) {
        return ResponseEntity.ok(dashboardService.getGlobalStats(academicYearId));
    }


}
