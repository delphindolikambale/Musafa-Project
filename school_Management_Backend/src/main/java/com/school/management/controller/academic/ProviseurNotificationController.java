package com.school.management.controller.academic;

import com.school.management.dto.academic.ProviseurNotificationCreateDTO;
import com.school.management.dto.academic.ProviseurNotificationResponseDTO;
import com.school.management.service.academic.ProviseurNotificationService;
import com.school.management.model.multitenant.School;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
// ✅ CORRECTION CORS : Ajout des domaines locaux autorisés avec prise en charge des identifiants (Credentials) pour éviter le blocage du Token
@CrossOrigin(origins = {"http://localhost:5170","http://localhost:5171","http://localhost:5172","http://localhost:5173", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"}, allowCredentials = "true")
public class ProviseurNotificationController {

    @Autowired
    private ProviseurNotificationService notificationService;

    /**
     * Extraction contextuelle de l'école depuis le token d'authentification JWT
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof SchoolContextDetails) {
                return ((SchoolContextDetails) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @PostMapping
    public ResponseEntity<ProviseurNotificationResponseDTO> createNotification(@RequestBody ProviseurNotificationCreateDTO createDTO) {
        // ✅ ISOLATION MULTI-TENANT : Récupération de l'école courante
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(notificationService.createAndBroadcastNotification(createDTO, currentSchool.getId()));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<ProviseurNotificationResponseDTO>> getNotificationsByRole(
            @PathVariable String role,
            @RequestParam(required = false, defaultValue = "false") boolean onlyUnread) {
        // ✅ ISOLATION MULTI-TENANT : Filtrage strict par école pour empêcher l'école X de voir les alertes de l'école Y
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(notificationService.getNotificationsByRole(role, onlyUnread, currentSchool.getId()));
    }

    @GetMapping("/role/{role}/count-unread")
    public ResponseEntity<Long> countUnread(@PathVariable String role) {
        // ✅ ISOLATION MULTI-TENANT : Compte restreint à l'établissement de l'utilisateur connecté
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(notificationService.countUnreadNotifications(role, currentSchool.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        // ✅ ISOLATION MULTI-TENANT : Validation de l'appartenance de la notification au tenant avant modification
        School currentSchool = getCurrentSchool();
        notificationService.markAsRead(id, currentSchool.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/role/{role}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String role) {
        // ✅ ISOLATION MULTI-TENANT : Action de masse limitée à l'école de l'utilisateur connecté
        School currentSchool = getCurrentSchool();
        notificationService.markAllAllAsRead(role, currentSchool.getId());
        return ResponseEntity.ok().build();
    }
}