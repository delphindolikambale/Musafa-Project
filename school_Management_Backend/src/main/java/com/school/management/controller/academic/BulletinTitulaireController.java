package com.school.management.controller.academic;

import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.model.academic.TeacherBulletinNotification;
import com.school.management.service.academicImpl.BulletinTitulaireServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulletins/titulaire")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BulletinTitulaireController {

    @Autowired
    private BulletinTitulaireServiceImpl bulletinTitulaireService;

    @PostMapping("/validate")
    public ResponseEntity<?> validateFiche(
            @RequestParam Long classroomId,
            @RequestParam Long subjectId,
            @RequestParam String periodId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId) {
        try {
            bulletinTitulaireService.validateGradeSheet(classroomId, subjectId, periodId, academicYearId, schoolId);
            return ResponseEntity.ok().body("{\"message\": \"Fiche validée avec succès au bulletin.\"}");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Erreur lors de la validation de la fiche.\"}");
        }
    }

    @GetMapping("/folders")
    public ResponseEntity<List<BulletinFolderDTO>> getBulletinFolders(
            @RequestParam Long teacherId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId) {

        List<BulletinFolderDTO> folders = bulletinTitulaireService.getBulletinFolders(teacherId, academicYearId, schoolId);
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/folders/{folderId}/students")
    public ResponseEntity<List<StudentBulletinRowDTO>> getStudentsInFolder(
            @PathVariable Long folderId) {

        List<StudentBulletinRowDTO> students = bulletinTitulaireService.getStudentsInFolder(folderId);
        return ResponseEntity.ok(students);
    }

    // AJOUT : Endpoint pour récupérer les données du bulletin d'un élève spécifique
    @GetMapping("/folders/{folderId}/students/{studentId}/bulletin")
    public ResponseEntity<?> getStudentBulletinData(
            @PathVariable Long folderId,
            @PathVariable Long studentId) {
        try {
            Map<String, Object> bulletinData = bulletinTitulaireService.getStudentBulletinData(folderId, studentId);
            return ResponseEntity.ok(bulletinData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Erreur lors de la récupération des données du bulletin.\"}");
        }
    }

    // AJOUT : Endpoint pour le téléchargement du PDF réceptionné
    @GetMapping("/download/{studentId}")
    public ResponseEntity<?> downloadBulletinPdf(@PathVariable Long studentId) {
        try {
            // Logique de téléchargement gérée par le service (retour du flux binaire PDF)
            return ResponseEntity.ok().body("{\"message\": \"Endpoint de téléchargement prêt.\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Erreur lors du téléchargement du PDF.\"}");
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<TeacherBulletinNotification>> getNotifications(
            @RequestParam Long teacherId,
            @RequestParam Long schoolId) {
        List<TeacherBulletinNotification> notifications = bulletinTitulaireService.getTeacherNotifications(teacherId, schoolId);
        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            bulletinTitulaireService.deleteNotification(id);
            return ResponseEntity.ok().body("{\"message\": \"Notification supprimée avec succès.\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Erreur lors de la suppression de la notification.\"}");
        }
    }
}