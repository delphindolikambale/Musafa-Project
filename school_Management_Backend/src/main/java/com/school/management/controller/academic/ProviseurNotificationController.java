package com.school.management.controller.academic;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import com.school.management.service.academic.ProviseurNotificationService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import com.school.management.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
// ✅ CORRECTION CORS : Retrait de @CrossOrigin pour laisser WebSecurityConfig gérer les headers proprement.
public class ProviseurNotificationController {

    private static final Logger logger = LoggerFactory.getLogger(ProviseurNotificationController.class);

    @Autowired
    private ProviseurNotificationService notificationService;

    /**
     * Extraction contextuelle de l'école depuis le token d'authentification JWT
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("[MULTI-TENANT] Erreur : Aucun contexte d'authentification présent (Token JWT manquant ou invalide).");
            throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
        }

        Object principal = authentication.getPrincipal();

        // 1. Extraction directe depuis UserDetailsImpl (cas le plus fréquent)
        if (principal instanceof UserDetailsImpl userDetails) {
            if (userDetails.getSchool() != null) {
                return userDetails.getSchool();
            }
            logger.warn("[MULTI-TENANT] L'utilisateur '{}' est authentifié mais n'a aucune école rattachée.", userDetails.getUsername());
        }

        // 2. Support pour l'interface SchoolContextDetails
        if (principal instanceof SchoolContextDetails schoolContext) {
            if (schoolContext.getSchool() != null) {
                return schoolContext.getSchool();
            }
        }

        logger.error("[MULTI-TENANT] Impossible d'extraire l'école. Type de Principal : {}", principal != null ? principal.getClass().getName() : "null");
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @PostMapping
    public ResponseEntity<ProviseurNotificationResponseDTO> createNotification(@RequestBody ProviseurNotificationCreateDTO createDTO) {
        try {
            School currentSchool = getCurrentSchool();
            return ResponseEntity.ok(notificationService.createAndBroadcastNotification(createDTO, currentSchool.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<ProviseurNotificationResponseDTO>> getNotificationsByRole(
            @PathVariable String role,
            @RequestParam(required = false, defaultValue = "false") boolean onlyUnread) {
        try {
            School currentSchool = getCurrentSchool();
            return ResponseEntity.ok(notificationService.getNotificationsByRole(role, onlyUnread, currentSchool.getId()));
        } catch (RuntimeException e) {
            // ✅ CORRECTION 500 : Retourne une liste vide au lieu de lever une exception
            logger.warn("[NOTIFICATIONS] Contexte d'école indisponible. Retour d'une liste vide.");
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/role/{role}/count-unread")
    public ResponseEntity<Long> countUnread(@PathVariable String role) {
        try {
            School currentSchool = getCurrentSchool();
            return ResponseEntity.ok(notificationService.countUnreadNotifications(role, currentSchool.getId()));
        } catch (RuntimeException e) {
            // ✅ CORRECTION 500 : Retourne 0
            return ResponseEntity.ok(0L);
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        try {
            School currentSchool = getCurrentSchool();
            notificationService.markAsRead(id, currentSchool.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/role/{role}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String role) {
        try {
            School currentSchool = getCurrentSchool();
            notificationService.markAllAllAsRead(role, currentSchool.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}