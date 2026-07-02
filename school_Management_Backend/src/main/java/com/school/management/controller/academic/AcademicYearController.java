package com.school.management.controller.academic;

import com.school.management.model.academic.AcademicYear;
import com.school.management.model.multitenant.School;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT : Import du bon type utilisateur principal
import com.school.management.service.academicImpl.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {
    private final AcademicYearService academicYearService;

    /**
     * Méthode d'extraction du contexte de l'école active à partir de l'utilisateur authentifié (JWT).
     * S'adapte à votre classe d'implémentation de UserDetails / UserPrincipal contenant l'établissement.
     */
    private School getCurrentSchool() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();

            // ✅ ADAPTATION : Utilisation directe du véritable type UserDetailsImpl pour extraire l'école en toute sécurité
            if (principal instanceof UserDetailsImpl) {
                return ((UserDetailsImpl) principal).getSchool();
            }
        }
        throw new RuntimeException("Aucune session ou contexte d'école valide détecté pour cette action.");
    }

    @PostMapping
    public ResponseEntity<AcademicYear> createAcademicYear(@RequestBody AcademicYear academicYear) {
        School currentSchool = getCurrentSchool();
        // ✅ Modification ici : Passage de l'ID (Long) au lieu de l'entité complète School
        AcademicYear saved = academicYearService.save(academicYear, currentSchool.getId());
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(academicYearService.findAll(currentSchool.getId()));
    }

    /**
     * Retourne l'année active de l'école ou 204 si aucune n'est configurée.
     */
    @GetMapping("/active")
    public ResponseEntity<AcademicYear> getActiveYear() {
        School currentSchool = getCurrentSchool();
        AcademicYear active = academicYearService.getAnneeActive(currentSchool.getId());
        if (active == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(active);
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateYear(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        academicYearService.activerAnnee(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYear> updateAcademicYear(@PathVariable Long id, @RequestBody AcademicYear academicYear) {
        School currentSchool = getCurrentSchool();
        academicYear.setId(id);
        // ✅ Modification ici : Passage de l'ID (Long) au lieu de l'entité complète School
        AcademicYear updated = academicYearService.save(academicYear, currentSchool.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteYear(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        academicYearService.delete(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Contrat ou interface de marquage utilitaire pour l'extraction sécurisée.
     * Permet d'assurer la compilation. À mapper avec votre classe de Principal (ex: MyUserDetails).
     */
    public interface SchoolContextDetails {
        School getSchool();
    }
}