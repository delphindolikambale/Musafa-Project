package com.school.management.service.financial;

import com.school.management.dto.financial.CashBookDashboardDTO;
import com.school.management.dto.financial.CashTransactionCreateDTO;
import com.school.management.dto.financial.CashTransactionResponseDTO;

import java.util.List;

public interface CashTransactionService {

    CashTransactionResponseDTO recordTransaction(CashTransactionCreateDTO dto);
    List<CashTransactionResponseDTO> getLivreDeCaisse(Long academicYearId);
    CashBookDashboardDTO getDashboardData(Long academicYearId);
}
