package com.school.management.service.financial;

import com.school.management.dto.financial.StudentAnnualFinancialProfileCreateDTO;
import com.school.management.dto.financial.StudentAnnualFinancialProfileResponseDTO;

import java.util.List;

public interface StudentAnnualFinancialProfileService {

    StudentAnnualFinancialProfileResponseDTO create(
            StudentAnnualFinancialProfileCreateDTO dto);

    StudentAnnualFinancialProfileResponseDTO getById(Long id);

    List<StudentAnnualFinancialProfileResponseDTO> getAll();

    List<StudentAnnualFinancialProfileResponseDTO>
    getByAccountNumber(String accountNumber);

    /**
     * ✅ NOUVEAU : Récupère la situation financière de tous les élèves d'une classe.
     */
    List<StudentAnnualFinancialProfileResponseDTO> getByClassroom(Long classroomId);
}
