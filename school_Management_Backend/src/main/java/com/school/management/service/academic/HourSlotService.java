package com.school.management.service.academic;

import com.school.management.dto.academic.HourSlotCreateDTO;
import com.school.management.dto.academic.HourSlotResponseDTO;
import java.util.List;

public interface HourSlotService {
    HourSlotResponseDTO addHourSlot(HourSlotCreateDTO dto);
    List<HourSlotResponseDTO> getSchoolHourSlots(Long schoolId);
    HourSlotResponseDTO updateHourSlot(Long schoolId, Long id, HourSlotCreateDTO dto);
    void deleteHourSlot(Long schoolId, Long id);
}