package com.school.management.service.financial;

import com.school.management.dto.financial.StudentFinancialAccountCreateDTO;
import com.school.management.dto.financial.StudentFinancialAccountListDTO;
import com.school.management.dto.financial.StudentFinancialAccountResponseDTO;

import java.util.List;

public interface StudentFinancialAccountService {

    StudentFinancialAccountResponseDTO create(StudentFinancialAccountCreateDTO dto, Long schoolId);
    StudentFinancialAccountResponseDTO getById(Long id, Long schoolId);
    StudentFinancialAccountResponseDTO getByAccountNumber(String accountNumber, Long schoolId);
    List<StudentFinancialAccountResponseDTO> search(String keyword, Long schoolId);
    List<StudentFinancialAccountListDTO> getAll(Long schoolId);
    StudentFinancialAccountResponseDTO getDetailsByAccountNumber(String accountNumber, Long schoolId);
}