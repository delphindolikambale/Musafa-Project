package com.school.management.service.financial;

import com.school.management.dto.financial.ExpenseCreateDTO;
import com.school.management.dto.financial.ExpenseResponseDTO;

import java.util.List;
public interface ExpenseService {

    ExpenseResponseDTO createExpense(ExpenseCreateDTO dto);
    List<ExpenseResponseDTO> getAllExpenses();
    ExpenseResponseDTO getById(Long id);
    List<ExpenseResponseDTO> getByAcademicYear(Long academicYearId);
}
