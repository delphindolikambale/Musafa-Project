package com.school.management.service.financial;

import com.school.management.dto.financial.MyFinancialStatusDTO;

public interface MyStudentFinanceService {
    /**
     * Récupère la situation financière complète de l'année active
     * pour l'étudiant actuellement connecté.
     * @param username le pseudonyme ou identifiant unique de l'élève connecté (Sujet du JWT)
     * @return MyFinancialStatusDTO
     */
    MyFinancialStatusDTO getMyCurrentFinancialStatus(String username);
}