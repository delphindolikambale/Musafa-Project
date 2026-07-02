package com.school.management.controller.financial;

import com.school.management.dto.financial.StudentAnnualFinancialProfileCreateDTO;
import com.school.management.dto.financial.StudentAnnualFinancialProfileResponseDTO;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/annual-profiles")
@RequiredArgsConstructor
public class StudentAnnualFinancialProfileController {

    private final StudentAnnualFinancialProfileService service;

    /**
     * Extraction contextuelle de l'école depuis le token d'authentification
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
    @ResponseStatus(HttpStatus.CREATED)
    public StudentAnnualFinancialProfileResponseDTO create(@Valid @RequestBody StudentAnnualFinancialProfileCreateDTO dto) {
        School currentSchool = getCurrentSchool();
        return service.create(dto, currentSchool.getId());
    }

    @GetMapping
    public List<StudentAnnualFinancialProfileResponseDTO> getAll() {
        School currentSchool = getCurrentSchool();
        return service.getAll(currentSchool.getId());
    }

    @GetMapping("/{id}")
    public StudentAnnualFinancialProfileResponseDTO getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return service.getById(id, currentSchool.getId());
    }

    @GetMapping("/account/{accountNumber}")
    public List<StudentAnnualFinancialProfileResponseDTO> getByAccountNumber(@PathVariable String accountNumber) {
        School currentSchool = getCurrentSchool();
        return service.getByAccountNumber(accountNumber, currentSchool.getId());
    }

    @Operation(summary = "Endpoint pour le recouvrement par classe")
    @GetMapping("/classroom/{classroomId}")
    public List<StudentAnnualFinancialProfileResponseDTO> getByClassroom(@PathVariable Long classroomId) {
        School currentSchool = getCurrentSchool();
        return service.getByClassroom(classroomId, currentSchool.getId());
    }
}