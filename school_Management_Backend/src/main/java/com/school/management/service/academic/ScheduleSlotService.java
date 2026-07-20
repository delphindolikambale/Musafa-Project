package com.school.management.service.academic;

import com.school.management.dto.academic.ScheduleSlotCreateDTO;
import com.school.management.dto.academic.ScheduleSlotResponseDTO;

import java.util.List;

public interface ScheduleSlotService {

    ScheduleSlotResponseDTO addSlot(ScheduleSlotCreateDTO dto);
    List<ScheduleSlotResponseDTO> getClassroomSchedule(Long schoolId, Long classroomId, Long academicYearId);
    void deleteSlot(Long schoolId, Long slotId);
    ScheduleSlotResponseDTO updateSlot(Long schoolId, Long slotId, ScheduleSlotCreateDTO dto); // ✅ AJOUT
}