package com.school.management.controller.financial;

import com.school.management.dto.financial.InstallmentScheduleDTO;
import com.school.management.dto.financial.InstallmentScheduleResponseDTO;
import com.school.management.model.financial.InstallmentSchedule;
import com.school.management.service.financial.InstallmentScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/installments")
@RequiredArgsConstructor

public class InstallmentScheduleController {
    private final InstallmentScheduleService service;

    @GetMapping("/schedule-fees/{scheduleFeesId}")
    public ResponseEntity<List<InstallmentScheduleResponseDTO>> getByScheduleFees(@PathVariable Long scheduleFeesId) {
        return ResponseEntity.ok(
                service.getByScheduleFees(scheduleFeesId)
                        .stream()
                        .map(this::mapToResponseDTO)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstallmentScheduleResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponseDTO(service.getById(id)));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Void> markAsPaid(@PathVariable Long id) {
        service.markAsPaid(id);
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
