package com.school.management.service.financial;
import com.school.management.dto.financial.DetailsCashTransactionCreateDTO;
import com.school.management.dto.financial.DetailsCashTransactionResponseDTO;
import java.util.List;

public interface DetailsCashTransactionService {
    void record(DetailsCashTransactionCreateDTO dto);
    List<DetailsCashTransactionResponseDTO> getJournalDetails(String academicYear);
    void migrateAll();
}
