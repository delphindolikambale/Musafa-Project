package com.school.management.service.financialImpl;

import com.school.management.dto.financial.FinancialNotificationDTO;
import com.school.management.model.financial.Notification;
import com.school.management.model.multitenant.School;
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

    public void sendPricingUpdate(String className, BigDecimal oldAmount, BigDecimal newAmount, String currency, Long schoolId) {
        String message = String.format(
                "MISE À JOUR : Le barème de la classe [%s] est passé de %s %s à %s %s",
                className, oldAmount, currency, newAmount, currency
        );

        // 1. Sauvegarde cloisonnée par école
        Notification notif = Notification.builder()
                .type("PRICING")
                .message(message)
                .createdAt(LocalDateTime.now())
                .school(School.builder().id(schoolId).build()) // ✅ Renseignement du Tenant
                .build();
        notificationRepository.save(notif);

        log.info("[École ID: {}] Envoi notification WebSocket (Pricing) : {}", schoolId, message);

        // 2. Envoi temps réel ciblé par école (évite les fuites sur le front)
        messagingTemplate.convertAndSend("/topic/school/" + schoolId + "/financial-notifications", message);
    }

    /**
     * Pour les nouvelles inscriptions (Persistance + WebSocket)
     */
    public void sendEnrollmentNotification(FinancialNotificationDTO enrollmentData, Long schoolId) {
        String dbMessage = String.format("Inscription de %s en %s (Compte: %s)",
                enrollmentData.getStudentName(),
                enrollmentData.getClassroom(),
                enrollmentData.getAccountNumber());

        // 1. Sauvegarde en base de données liée à la School
        Notification notif = Notification.builder()
                .type("ENROLLMENT")
                .message(dbMessage)
                .studentName(enrollmentData.getStudentName())
                .accountNumber(enrollmentData.getAccountNumber())
                .classroom(enrollmentData.getClassroom())
                .amountDue(enrollmentData.getAmountDue())
                .currency(enrollmentData.getCurrency())
                .createdAt(LocalDateTime.now())
                .school(School.builder().id(schoolId).build()) // ✅ Renseignement du Tenant
                .build();

        notificationRepository.save(notif);

        log.info("[École ID: {}] Envoi notification WebSocket (Enrollment) pour : {}", schoolId, enrollmentData.getStudentName());

        // 2. Envoi temps réel ciblé sur le canal privé de l'établissement
        messagingTemplate.convertAndSend("/topic/school/" + schoolId + "/financial-notifications", enrollmentData);
    }
}