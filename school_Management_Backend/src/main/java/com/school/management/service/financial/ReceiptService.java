package com.school.management.service.financial;

import com.school.management.dto.financial.StudentReceiptDTO;

public interface ReceiptService {

    // ✅ Sécurisation multi-tenant ajoutée aux signatures du service de reçu
    StudentReceiptDTO getReceiptData(Long paymentId, Long schoolId);

    byte[] generateReceiptPdf(Long paymentId, Long schoolId);
}