package com.school.management.service.financial;

import com.school.management.dto.financial.FeesItemCreateDTO;
import com.school.management.dto.financial.FeesItemResponseDTO;

import java.util.List;

public interface FeesItemService {
    FeesItemResponseDTO create(FeesItemCreateDTO dto, Long schoolId);
    FeesItemResponseDTO update(Long id, FeesItemCreateDTO dto, Long schoolId);
    void delete(Long id, Long schoolId);
    List<FeesItemResponseDTO> getAll(Long schoolId);
    List<FeesItemResponseDTO> getByFeesGroup(Long feesGroupId, Long schoolId);
}