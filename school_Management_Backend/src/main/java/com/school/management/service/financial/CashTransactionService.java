package com.school.management.service.financial;

import com.school.management.dto.financial.CashBookDashboardDTO;
import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.CashTransactionResponseDTO;

import java.util.List;

public interface CashTransactionService {

    CashTransactionResponseDTO recordTransaction(CashTransactionCreateDTO dto, Long schoolId);
    List<CashTransactionResponseDTO> getLivreDeCaisse(Long academicYearId, Long schoolId);
    CashBookDashboardDTO getDashboardData(Long academicYearId, Long schoolId);
}