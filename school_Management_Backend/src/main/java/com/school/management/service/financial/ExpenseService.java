package com.school.management.service.financial;

import com.school.management.dto.financial.ExpenseCreateDTO;
import com.school.management.dto.financial.ExpenseResponseDTO;

import java.util.List;

public interface ExpenseService {

    // ✅ Propagation de l'identifiant schoolId dans le contrat de service
    ExpenseResponseDTO createExpense(ExpenseCreateDTO dto, Long schoolId);
    List<ExpenseResponseDTO> getAllExpenses(Long schoolId);
    ExpenseResponseDTO getById(Long id, Long schoolId);
    List<ExpenseResponseDTO> getByAcademicYear(Long academicYearId, Long schoolId);
}