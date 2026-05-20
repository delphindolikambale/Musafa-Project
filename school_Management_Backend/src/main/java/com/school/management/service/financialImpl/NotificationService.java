package com.school.management.service.financialImpl;
import com.school.management.dto.financial.FinancialNotificationDTO;
import com.school.management.model.financial.Notification;
import com.school.management.repository.financial.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public void sendPricingUpdate(String className, BigDecimal oldAmount, BigDecimal newAmount, String currency) {
        String message = String.format(
                "MISE À JOUR : Le barème de la classe [%s] est passé de %s %s à %s %s",
                className, oldAmount, currency, newAmount, currency
        );

        // 1. Sauvegarde en base de données
        Notification notif = Notification.builder()
                .type("PRICING")
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);

        log.info("Envoi notification WebSocket (Pricing) : {}", message);

        // 2. Envoi temps réel
        messagingTemplate.convertAndSend("/topic/financial-notifications", message);
    }

    /**
     * Pour les nouvelles inscriptions (Persistance + WebSocket)
     */
    public void sendEnrollmentNotification(FinancialNotificationDTO enrollmentData) {
        // 1. Sauvegarde en base de données pour que ça reste au rafraîchissement
        // On construit un message texte pour la table Notification
        String dbMessage = String.format("Inscription de %s en %s (Compte: %s)",
                enrollmentData.getStudentName(),
                enrollmentData.getClassroom(),
                enrollmentData.getAccountNumber());

        Notification notif = Notification.builder()
                .type("ENROLLMENT")
                .message(dbMessage)
                // On stocke les métadonnées pour que le Front puisse reconstruire l'objet au refresh
                .studentName(enrollmentData.getStudentName())
                .accountNumber(enrollmentData.getAccountNumber())
                .classroom(enrollmentData.getClassroom())
                .amountDue(enrollmentData.getAmountDue())
                .currency(enrollmentData.getCurrency())
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notif);

        log.info("Envoi notification WebSocket (Enrollment) pour : {}", enrollmentData.getStudentName());

        // 2. Envoi temps réel de l'objet complet DTO
        messagingTemplate.convertAndSend("/topic/financial-notifications", enrollmentData);
    }
}
