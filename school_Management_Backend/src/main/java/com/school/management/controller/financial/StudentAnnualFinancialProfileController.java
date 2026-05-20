package com.school.management.controller.financial;

import com.school.management.dto.financial.StudentAnnualFinancialProfileCreateDTO;
import com.school.management.dto.financial.StudentAnnualFinancialProfileResponseDTO;
import com.school.management.service.financial.StudentAnnualFinancialProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// Ajout de /v1/ pour la cohérence avec vos autres APIs et Postman
@RequestMapping("/api/v1/annual-profiles")
@RequiredArgsConstructor

public class StudentAnnualFinancialProfileController {

    private final StudentAnnualFinancialProfileService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentAnnualFinancialProfileResponseDTO create(@Valid @RequestBody StudentAnnualFinancialProfileCreateDTO dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<StudentAnnualFinancialProfileResponseDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public StudentAnnualFinancialProfileResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/account/{accountNumber}")
    public List<StudentAnnualFinancialProfileResponseDTO> getByAccountNumber(@PathVariable String accountNumber) {
        return service.getByAccountNumber(accountNumber);
    }

    /**
     * ✅ NOUVEAU : Endpoint pour le recouvrement par classe.
     * Appelé par le frontend via : GET /api/financial-profiles/classroom/{classroomId}
     */
    @GetMapping("/classroom/{classroomId}")
    public List<StudentAnnualFinancialProfileResponseDTO> getByClassroom(@PathVariable Long classroomId) {
        return service.getByClassroom(classroomId);
    }
}
