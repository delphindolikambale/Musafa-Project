package com.school.management.service.financial;

import com.school.management.dto.financial.StudentFinancialAccountCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountListDTO;
import com.school.management.dto.financial.StudentFinancialAccountResponseDTO;

import java.util.List;

public interface StudentFinancialAccountService {

    StudentFinancialAccountResponseDTO create(StudentFinancialAccountCreateDTO dto);
    StudentFinancialAccountResponseDTO getById(Long id);
    StudentFinancialAccountResponseDTO getByAccountNumber(String accountNumber);
    List<StudentFinancialAccountResponseDTO> search(String keyword);
    List<StudentFinancialAccountListDTO> getAll();
    StudentFinancialAccountResponseDTO getDetailsByAccountNumber(String accountNumber);
}
