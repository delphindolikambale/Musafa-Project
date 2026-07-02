package com.school.management.controller.financial;

import com.school.management.model.auth.User;
import com.school.management.model.financial.Notification;
import com.school.management.repository.auth.UserRepository;
import com.school.management.repository.financial.NotificationRepository;
import com.school.management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return ResponseEntity.ok(repository.findAllBySchoolIdOrderByCreatedAtDesc(schoolId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        return repository.findById(id)
                .filter(n -> n.getSchool() != null && n.getSchool().getId().equals(schoolId))
                .map(n -> {
                    n.setRead(true);
                    return ResponseEntity.ok(repository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable"));

        if (notification.getSchool() == null || !notification.getSchool().getId().equals(schoolId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        repository.delete(notification);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll(Authentication authentication) {
        Long schoolId = getSchoolIdFromAuthentication(authentication);
        // ✅ Sécurité Multi-tenant : Supprime uniquement les notifications de l'école connectée
        List<Notification> schoolNotifications = repository.findAllBySchoolIdOrderByCreatedAtDesc(schoolId);
        repository.deleteAll(schoolNotifications);
        return ResponseEntity.noContent().build();
    }

    private Long getSchoolIdFromAuthentication(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
        return user.getSchool().getId();
    }
}