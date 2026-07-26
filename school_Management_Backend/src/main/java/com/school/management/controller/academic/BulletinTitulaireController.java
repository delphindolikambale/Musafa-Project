package com.school.management.controller.academic;

import com.school.management.dto.academic.bulletin.BulletinFolderDTO;
import com.school.management.dto.academic.bulletin.StudentBulletinRowDTO;
import com.school.management.service.academic.BulletinTitulaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bulletins/titulaire")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BulletinTitulaireController {

    @Autowired
    private BulletinTitulaireService bulletinTitulaireService;

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

    // Endpoint pour récupérer les dossiers de bulletins de la classe du Titulaire
    @GetMapping("/folders")
    public ResponseEntity<List<BulletinFolderDTO>> getBulletinFolders(
            @RequestParam Long teacherId,
            @RequestParam Long academicYearId,
            @RequestParam Long schoolId) {

        List<BulletinFolderDTO> folders = bulletinTitulaireService.getBulletinFolders(teacherId, academicYearId, schoolId);
        return ResponseEntity.ok(folders);
    }

    // Endpoint pour récupérer les élèves et l'état de leur bulletin dans un dossier
    @GetMapping("/folders/{classroomId}/students")
    public ResponseEntity<List<StudentBulletinRowDTO>> getStudentsInFolder(
            @PathVariable Long classroomId,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long schoolId) {

        List<StudentBulletinRowDTO> students = bulletinTitulaireService.getStudentsInFolder(classroomId, academicYearId, schoolId);
        return ResponseEntity.ok(students);
    }
}