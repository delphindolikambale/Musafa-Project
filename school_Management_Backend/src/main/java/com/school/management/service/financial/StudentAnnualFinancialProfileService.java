package com.school.management.service.financial;

import com.school.management.dto.financial.StudentAnnualFinancialProfileCreateDTO;
import com.school.management.dto.financial.StudentAnnualFinancialProfileResponseDTO;

import java.util.List;

public interface StudentAnnualFinancialProfileService {

    StudentAnnualFinancialProfileResponseDTO create(StudentAnnualFinancialProfileCreateDTO dto, Long schoolId);

    StudentAnnualFinancialProfileResponseDTO getById(Long id, Long schoolId);

    List<StudentAnnualFinancialProfileResponseDTO> getAll(Long schoolId);

    List<StudentAnnualFinancialProfileResponseDTO> getByAccountNumber(String accountNumber, Long schoolId);

    List<StudentAnnualFinancialProfileResponseDTO> getByClassroom(Long classroomId, Long schoolId);
}