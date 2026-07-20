package com.school.management.controller.academic;

import com.school.management.dto.academic.HourSlotCreateDTO;
import com.school.management.dto.academic.HourSlotResponseDTO;
import com.school.management.service.academic.HourSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hour-slots")
@RequiredArgsConstructor
public class HourSlotController {

    private final HourSlotService hourSlotService;

    @PostMapping
    public ResponseEntity<HourSlotResponseDTO> createHourSlot(@Valid @RequestBody HourSlotCreateDTO dto) {
        return new ResponseEntity<>(hourSlotService.addHourSlot(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HourSlotResponseDTO>> getSchoolHourSlots(@RequestHeader("X-School-Id") Long schoolId) {
        return ResponseEntity.ok(hourSlotService.getSchoolHourSlots(schoolId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHourSlot(@RequestHeader("X-School-Id") Long schoolId, @PathVariable Long id) {
        hourSlotService.deleteHourSlot(schoolId, id);
        return ResponseEntity.noContent().build();
    }
}