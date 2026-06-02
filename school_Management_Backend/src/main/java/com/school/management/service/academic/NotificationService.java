package com.school.management.service.academic;



import com.school.management.dto.academic.NotificationCreateDTO;
import com.school.management.dto.academic.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {

    NotificationResponseDTO createAndBroadcastNotification(NotificationCreateDTO createDTO);
    List<NotificationResponseDTO> getNotificationsByRole(String targetRole, boolean onlyUnread);
    void markAsRead(Long notificationId);
    void markAllAllAsRead(String targetRole);
    long countUnreadNotifications(String targetRole);
}
