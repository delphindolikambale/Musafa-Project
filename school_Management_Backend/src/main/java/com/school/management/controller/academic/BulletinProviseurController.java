package com.school.management.controller.academic;

import com.school.management.dto.academic.bulletin.BulletinInitResponseDTO;
import com.school.management.dto.academic.bulletin.ClassroomBasicDTO;
import com.school.management.service.academicImpl.BulletinProviseurServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bulletins/proviseur")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class BulletinProviseurController {

    private final BulletinProviseurServiceImpl bulletinProviseurService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Endpoint 1 : Charge les classes pour le ComboBox
     */
    @GetMapping("/classes")
    public ResponseEntity<List<ClassroomBasicDTO>> getClassesForComboBox(
            @RequestParam Long schoolId) {

        List<ClassroomBasicDTO> classes = bulletinProviseurService.getClassesForComboBox(schoolId);
        return ResponseEntity.ok(classes);
    }

    /**
     * Endpoint 2 : Charge les infos complètes du bulletin (Effectif, Titulaire, Maxima)
     */
    @GetMapping("/init-data")
    public ResponseEntity<BulletinInitResponseDTO> getBulletinInitializationData(
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId) {

        BulletinInitResponseDTO initData = bulletinProviseurService.getBulletinInitData(classroomId, academicYearId, schoolId);
        return ResponseEntity.ok(initData);
    }

    /**
     * Endpoint 3 : Initialise et génère les bulletins vierges pour la classe.
     * Cette action débloque l'espace du titulaire.
     */
    @PostMapping("/initialize")
    public ResponseEntity<String> initializeBulletinsForClass(
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId,
            @RequestParam(required = false) Long teacherId) {

        // 1. Logique métier en base de données
        bulletinProviseurService.initializeBulletins(classroomId, academicYearId, schoolId);

        // 2. Notification temps réel au Titulaire via WebSocket (STOMP)
        if (teacherId != null) {
            String payload = String.format(
                    "{\"message\": \"De nouveaux bulletins ont été générés par le Proviseur. Veuillez rafraîchir ou consulter votre tableau de bord.\", " +
                            "\"action\": \"REFRESH\", " +
                            "\"type\": \"BULLETINS_DISPATCHED\", " +
                            "\"classroomId\": %d, " +
                            "\"teacherId\": %d}",
                    classroomId, teacherId
            );

            // ✅ CORRECTION : Routage dynamique vers le topic écouté par le TitulaireDashboard.jsx
            String dynamicTopic = String.format("/topic/bulletins/titulaire/%d/%d", schoolId, teacherId);
            messagingTemplate.convertAndSend(dynamicTopic, payload);
        } else {
            System.err.println("Avertissement: teacherId manquant. La base de données est mise à jour, mais la notification WebSocket n'a pas pu être envoyée.");
        }

        return ResponseEntity.ok().body("{\"message\": \"Bulletins générés et envoyés au titulaire avec succès.\"}");
    }
}