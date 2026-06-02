package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import com.school.management.model.academic.ProviseurNotification;
import com.school.management.repository.academic.ProviseurNotificationRepository;
import com.school.management.service.academic.ProviseurNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProviseurNotificationServiceImpl implements ProviseurNotificationService {

    @Autowired
    private ProviseurNotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public ProviseurNotificationResponseDTO createAndBroadcastNotification(ProviseurNotificationCreateDTO dto) {
        ProviseurNotification notification = new ProviseurNotification();
        notification.setType(dto.getType());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setTargetRole(dto.getTargetRole());
        notification.setSubjectName(dto.getSubjectName());
        notification.setClassroomName(dto.getClassroomName());
        notification.setPeriod(dto.getPeriod());
        notification.setTeacherName(dto.getTeacherName());
        notification.setAssignmentId(dto.getAssignmentId());

        ProviseurNotification savedNotification = notificationRepository.save(notification);
        ProviseurNotificationResponseDTO responseDTO = mapToResponseDTO(savedNotification);

        // Routage en temps réel vers le canal WebSocket approprié
        if ("PROVISEUR".equalsIgnoreCase(dto.getTargetRole()) || "ROLE_PROVISEUR".equalsIgnoreCase(dto.getTargetRole())) {
            messagingTemplate.convertAndSend("/topic/proviseur-notifications", responseDTO);
        }

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviseurNotificationResponseDTO> getNotificationsByRole(String targetRole, boolean onlyUnread) {
        List<ProviseurNotification> list;
        if (onlyUnread) {
            list = notificationRepository.findByTargetRoleAndReadStatusFalseOrderByCreatedAtDesc(targetRole);
        } else {
            list = notificationRepository.findByTargetRoleOrderByCreatedAtDesc(targetRole);
        }
        return list.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setReadStatus(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAllAllAsRead(String targetRole) {
        List<ProviseurNotification> unread = notificationRepository.findByTargetRoleAndReadStatusFalseOrderByCreatedAtDesc(targetRole);
        for (ProviseurNotification notification : unread) {
            notification.setReadStatus(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadNotifications(String targetRole) {
        return notificationRepository.countByTargetRoleAndReadStatusFalse(targetRole);
    }

    private ProviseurNotificationResponseDTO mapToResponseDTO(ProviseurNotification entity) {
        ProviseurNotificationResponseDTO responseDTO = new ProviseurNotificationResponseDTO();
        responseDTO.setId(entity.getId());
        responseDTO.setType(entity.getType());
        responseDTO.setTitle(entity.getTitle());
        responseDTO.setMessage(entity.getMessage());
        responseDTO.setTargetRole(entity.getTargetRole());
        responseDTO.setReadStatus(entity.isReadStatus());
        responseDTO.setCreatedAt(entity.getCreatedAt());
        responseDTO.setSubjectName(entity.getSubjectName());
        responseDTO.setClassroomName(entity.getClassroomName());
        responseDTO.setPeriod(entity.getPeriod());
        responseDTO.setTeacherName(entity.getTeacherName());
        responseDTO.setAssignmentId(entity.getAssignmentId());
        return responseDTO;
    }
}