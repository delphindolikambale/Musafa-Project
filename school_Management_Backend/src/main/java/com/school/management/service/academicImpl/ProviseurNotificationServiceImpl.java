package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import com.school.management.model.academic.ProviseurNotification;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.ProviseurNotificationRepository;
import com.school.management.service.academic.ProviseurNotificationService;
import com.school.management.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
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

    /**
     * EXTRACTION DU CONTEXTE MULTI-TENANT SÉCURISÉ (Garde-fou pour la validation d'accès)
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    @Override
    public ProviseurNotificationResponseDTO createAndBroadcastNotification(ProviseurNotificationCreateDTO dto, Long schoolId) {
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

        // ✅ MULTI-TENANT OPTIMISÉ : Liaison directe via l'ID de l'établissement transmis par le contrôleur
        School school = new School();
        school.setId(schoolId);
        notification.setSchool(school);

        ProviseurNotification savedNotification = notificationRepository.save(notification);
        ProviseurNotificationResponseDTO responseDTO = mapToResponseDTO(savedNotification);

        // ✅ MULTI-TENANT : Routage WebSocket hautement étanche cloisonné par identifiant d'école reçu
        if ("PROVISEUR".equalsIgnoreCase(dto.getTargetRole()) || "ROLE_PROVISEUR".equalsIgnoreCase(dto.getTargetRole())) {
            messagingTemplate.convertAndSend("/topic/proviseur-notifications/" + schoolId, responseDTO);
        }

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviseurNotificationResponseDTO> getNotificationsByRole(String targetRole, boolean onlyUnread, Long schoolId) {
        List<ProviseurNotification> list;

        // ✅ FILTRAGE DES REQUÊTES SUR LE COMPTE DE L'ÉCOLE TRANSMIS DIRECTEMENT PAR LE CONTROLLER
        if (onlyUnread) {
            list = notificationRepository.findByTargetRoleAndReadStatusFalseAndSchoolIdOrderByCreatedAtDesc(targetRole, schoolId);
        } else {
            list = notificationRepository.findByTargetRoleAndSchoolIdOrderByCreatedAtDesc(targetRole, schoolId);
        }
        return list.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId, Long schoolId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            // ✅ VALIDEUR MULTI-TENANT DE PROTECTION DE LIGNE STRICT
            if (!notification.getSchool().getId().equals(schoolId)) {
                throw new AccessDeniedException("❌ Action interdite : Traitement hors périmètre.");
            }
            notification.setReadStatus(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAllAllAsRead(String targetRole, Long schoolId) {
        // ✅ SÉLECTION LIMITÉE STRICTEMENT AU TENANT CONNECTÉ VIA LE PARAMÈTRE SECURISÉ
        List<ProviseurNotification> unread = notificationRepository.findByTargetRoleAndReadStatusFalseAndSchoolIdOrderByCreatedAtDesc(targetRole, schoolId);
        for (ProviseurNotification notification : unread) {
            notification.setReadStatus(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadNotifications(String targetRole, Long schoolId) {
        // ✅ COMPTAGE ISOLÉ DIRECTEMENT VIA LE PARAMÈTRE DU TENANT
        return notificationRepository.countByTargetRoleAndReadStatusFalseAndSchoolId(targetRole, schoolId);
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