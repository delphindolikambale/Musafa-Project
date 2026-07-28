package com.school.management.controller.academic;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.management.dto.academic.bulletin.BulletinInitResponseDTO;
import com.school.management.dto.academic.bulletin.ClassroomBasicDTO;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.TeacherBulletinNotification;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.service.academicImpl.BulletinProviseurServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulletins/proviseur")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class BulletinProviseurController {

    private final BulletinProviseurServiceImpl bulletinProviseurService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ClassroomRepository classroomRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/classes")
    public ResponseEntity<List<ClassroomBasicDTO>> getClassesForComboBox(@RequestParam Long schoolId) {
        List<ClassroomBasicDTO> classes = bulletinProviseurService.getClassesForComboBox(schoolId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/init-data")
    public ResponseEntity<BulletinInitResponseDTO> getBulletinInitializationData(
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId) {

        BulletinInitResponseDTO initData = bulletinProviseurService.getBulletinInitData(classroomId, academicYearId, schoolId);
        return ResponseEntity.ok(initData);
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeBulletinsForClass(
            @RequestParam Long classroomId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId,
            @RequestParam(required = false) Long teacherId) {

        // 1. Initialisation en Base de Données
        bulletinProviseurService.initializeBulletins(classroomId, academicYearId, schoolId);

        // 2. Résolution dynamique du Titulaire si teacherId non fourni par le frontend
        Classroom classroom = classroomRepository.findById(classroomId).orElse(null);
        Long targetTeacherId = teacherId;

        if (targetTeacherId == null && classroom != null && classroom.getTitulaire() != null) {
            targetTeacherId = classroom.getTitulaire().getId();
        }

        // 3. Notification BDD et Emission WebSocket
        if (targetTeacherId != null && classroom != null) {
            TeacherBulletinNotification savedNotif = bulletinProviseurService.createPersistentNotification(
                    targetTeacherId, schoolId, classroom.getDisplayName());

            try {
                Map<String, Object> payloadMap = new HashMap<>();
                payloadMap.put("notificationId", savedNotif.getId());
                payloadMap.put("message", savedNotif.getMessage());
                payloadMap.put("action", "BULLETINS_DISPATCHED");
                payloadMap.put("type", "BULLETINS_DISPATCHED");
                payloadMap.put("classroomId", classroomId);
                payloadMap.put("teacherId", targetTeacherId);
                payloadMap.put("schoolId", schoolId);
                payloadMap.put("timestamp", savedNotif.getCreatedAt().toString());

                String payload = objectMapper.writeValueAsString(payloadMap);
                String dynamicTopic = String.format("/topic/bulletins/titulaire/%d/%d", schoolId, targetTeacherId);

                messagingTemplate.convertAndSend(dynamicTopic, payload);
            } catch (Exception e) {
                System.err.println("Erreur lors de l'émission WebSocket : " + e.getMessage());
            }
        } else {
            System.err.println("Avertissement: Aucun titulaire assigné à la classe ID " + classroomId + ". Notification ignorée.");
        }

        return ResponseEntity.ok().body("{\"message\": \"La maquette générale du bulletin a été générée et transmis au titulaire avec succès.\"}");
    }
}