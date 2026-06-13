package com.school.management.service.financial;

import com.school.management.dto.financial.MyFinancialStatusDTO;

public interface MyStudentFinanceService {
    /**
     * Récupère la situation financière complète de l'année active
     * pour l'étudiant actuellement connecté.
     * * @param studentEmail l'email ou l'identifiant de l'élève connecté
     * @return MyFinancialStatusDTO
     */
    MyFinancialStatusDTO getMyCurrentFinancialStatus(String studentEmail);
}