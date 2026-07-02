package com.school.management.service.financial;

import com.school.management.dto.financial.ScheduleFeesDTO;
import com.school.management.dto.financial.ScheduleFeesResponseDTO;

import java.util.List;

public interface ScheduleFeesService {

    // ✅ Intégration du schoolId pour restreindre la manipulation des barèmes
    ScheduleFeesResponseDTO create(ScheduleFeesDTO dto, Long schoolId);

    ScheduleFeesResponseDTO getById(Long id, Long schoolId);

    List<ScheduleFeesResponseDTO> getAll(Long schoolId);

    List<ScheduleFeesResponseDTO> getByAcademicYear(Long academicYearId, Long schoolId);

    ScheduleFeesResponseDTO update(Long id, ScheduleFeesDTO dto, Long schoolId);

    void delete(Long id, Long schoolId);

    void deactivate(Long id, Long schoolId);
}