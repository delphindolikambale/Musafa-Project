package com.school.management.service.academic;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import java.util.List;

public interface ProviseurNotificationService {
    // ✅ ADAPTATION : Injection systématique du paramètre schoolId pour correspondre aux appels du contrôleur
    ProviseurNotificationResponseDTO createAndBroadcastNotification(ProviseurNotificationCreateDTO createDTO, Long schoolId);

    List<ProviseurNotificationResponseDTO> getNotificationsByRole(String targetRole, boolean onlyUnread, Long schoolId);

    void markAsRead(Long notificationId, Long schoolId);

    void markAllAllAsRead(String targetRole, Long schoolId);

    long countUnreadNotifications(String targetRole, Long schoolId);
}