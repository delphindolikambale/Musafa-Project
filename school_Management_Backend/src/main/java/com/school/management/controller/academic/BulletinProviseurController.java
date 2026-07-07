package com.school.management.controller.academic;

import com.school.management.dto.academic.bulletin.BulletinInitResponseDTO;
import com.school.management.dto.academic.bulletin.ClassroomBasicDTO;
import com.school.management.service.academicImpl.BulletinProviseurServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bulletins/proviseur")
@RequiredArgsConstructor
public class BulletinProviseurController {

    private final BulletinProviseurServiceImpl bulletinProviseurService;

    /**
     * Endpoint 1 : Charge les classes pour le ComboBox
     * Note: Dans un environnement SaaS, "schoolId" devrait idéalement être extrait
     * du Token JWT de l'utilisateur connecté via un @AuthenticationPrincipal.
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
}