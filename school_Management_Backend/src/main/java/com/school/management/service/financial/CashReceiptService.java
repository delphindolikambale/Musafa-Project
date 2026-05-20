package com.school.management.service.financial;

import com.school.management.dto.financial.CashReceiptDashboardDTO;

import java.time.LocalDate;

public interface CashReceiptService {
    CashReceiptDashboardDTO getDashboardData(String filterType, LocalDate date, Long classroomId);
}
