package com.school.management.controller.academic;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import com.school.management.service.academic.ProviseurNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class ProviseurNotificationController {

    @Autowired
    private ProviseurNotificationService notificationService;

    @PostMapping
    public ResponseEntity<ProviseurNotificationResponseDTO> createNotification(@RequestBody ProviseurNotificationCreateDTO createDTO) {
        return ResponseEntity.ok(notificationService.createAndBroadcastNotification(createDTO));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<ProviseurNotificationResponseDTO>> getNotificationsByRole(
            @PathVariable String role,
            @RequestParam(required = false, defaultValue = "false") boolean onlyUnread) {
        return ResponseEntity.ok(notificationService.getNotificationsByRole(role, onlyUnread));
    }

    @GetMapping("/role/{role}/count-unread")
    public ResponseEntity<Long> countUnread(@PathVariable String role) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(role));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/role/{role}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String role) {
        notificationService.markAllAllAsRead(role);
        return ResponseEntity.ok().build();
    }
}