package com.school.management.controller.financial;

import com.school.management.dto.financial.InstallmentScheduleResponseDTO;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.model.multitenant.School;
import com.school.management.service.financial.InstallmentScheduleService;
import com.school.management.controller.academic.AcademicYearController.SchoolContextDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/installments")
@RequiredArgsConstructor
public class InstallmentScheduleController {

    private final InstallmentScheduleService service;

    /**
     * Extraction sécurisée du contexte d'établissement actif (JWT)
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

    @GetMapping("/schedule-fees/{scheduleFeesId}")
    public ResponseEntity<List<InstallmentScheduleResponseDTO>> getByScheduleFees(@PathVariable Long scheduleFeesId) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(
                service.getByScheduleFees(scheduleFeesId, currentSchool.getId())
                        .stream()
                        .map(this::mapToResponseDTO)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstallmentScheduleResponseDTO> getById(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        return ResponseEntity.ok(mapToResponseDTO(service.getById(id, currentSchool.getId())));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Void> markAsPaid(@PathVariable Long id) {
        School currentSchool = getCurrentSchool();
        service.markAsPaid(id, currentSchool.getId());
        return ResponseEntity.noContent().build();
    }

    private InstallmentScheduleResponseDTO mapToResponseDTO(InstallmentSchedule installment) {
        InstallmentScheduleResponseDTO dto = new InstallmentScheduleResponseDTO();
        dto.setId(installment.getId());
        dto.setInstallmentNumber(installment.getInstallmentNumber());
        dto.setAmount(installment.getAmount());
        dto.setStartDate(installment.getStartDate());
        dto.setDueDate(installment.getDueDate());
        dto.setPaid(installment.getPaid());
        dto.setScheduleFeesId(installment.getScheduleFees() != null ? installment.getScheduleFees().getId() : null);
        dto.setLevelId(installment.getLevel() != null ? installment.getLevel().getId() : null);
        dto.setOptionId(installment.getOption() != null ? installment.getOption().getId() : null);
        return dto;
    }
}