package com.school.management.service.academic;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import java.util.List;

public interface ProviseurNotificationService {
    ProviseurNotificationResponseDTO createAndBroadcastNotification(ProviseurNotificationCreateDTO createDTO);
    List<ProviseurNotificationResponseDTO> getNotificationsByRole(String targetRole, boolean onlyUnread);
    void markAsRead(Long notificationId);
    void markAllAllAsRead(String targetRole);
    long countUnreadNotifications(String targetRole);
}