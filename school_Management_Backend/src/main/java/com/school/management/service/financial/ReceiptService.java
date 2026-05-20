package com.school.management.service.financial;

import com.school.management.dto.financial.StudentReceiptDTO;

/**
 * Service pour la gestion des reçus de paiement.
 * Définit les opérations de préparation des données et de génération de documents.
 */

public interface ReceiptService {

    /**
     * Récupère et assemble toutes les données nécessaires pour l'affichage d'un reçu.
     * Combine les informations de l'institution, de l'élève et du paiement.
     * @param paymentId L'identifiant unique du paiement (StudentPayment)
     * @return StudentReceiptDTO contenant les données formatées pour le reçu
     */
    StudentReceiptDTO getReceiptData(Long paymentId);

    /**
     * Génère le fichier binaire du reçu au format PDF via iText.
     * @param paymentId L'identifiant unique du paiement
     * @return Un tableau d'octets (byte[]) représentant le fichier PDF
     */
    byte[] generateReceiptPdf(Long paymentId);
}
