package com.school.management.service.financial;

import com.school.management.dto.financial.ScheduleFeesDTO;
import com.school.management.dto.financial.ScheduleFeesResponseDTO;
import com.school.management.model.financial.ScheduleFees;

import java.util.List;

public interface ScheduleFeesService {

    // CREATE
    ScheduleFeesResponseDTO create(ScheduleFeesDTO dto);

    // READ
    ScheduleFeesResponseDTO getById(Long id);

    List<ScheduleFeesResponseDTO> getAll();

    List<ScheduleFeesResponseDTO> getByAcademicYear(Long academicYearId);

    // UPDATE
    ScheduleFeesResponseDTO update(Long id, ScheduleFeesDTO dto);

    void delete(Long id);

    void deactivate(Long id);
}
