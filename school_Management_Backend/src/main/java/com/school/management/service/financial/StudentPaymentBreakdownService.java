package com.school.management.service.financial;

import com.school.management.dto.financial.StudentPaymentBreakdownResponseDTO;

import java.util.List;

public interface StudentPaymentBreakdownService {

    /**
     * Récupère le détail analytique (Scolarité, Divers, etc.) d'un paiement
     * avec vérification de l'isolation multi-tenant de l'école.
     */
    List<StudentPaymentBreakdownResponseDTO> getByPaymentId(Long paymentId, Long schoolId);
}