package com.school.management.service.financial;

import com.school.management.dto.financial.FeesGroupCreateDTO;
import com.school.management.dto.financial.FeesGroupResponseDTO;

import java.util.List;

public interface FeesGroupService {
    FeesGroupResponseDTO create(FeesGroupCreateDTO dto, Long schoolId);
    FeesGroupResponseDTO update(Long id, FeesGroupCreateDTO dto, Long schoolId);
    void delete(Long id, Long schoolId);
    List<FeesGroupResponseDTO> getAll(Long schoolId);
    List<FeesGroupResponseDTO> getByAcademicYear(Long academicYearId, Long schoolId);
    FeesGroupResponseDTO getById(Long id, Long schoolId);
    void deactivate(Long id, Long schoolId);
}