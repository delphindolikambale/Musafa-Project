package com.school.management.service.financial;

import com.school.management.dto.financial.FeesItemCreateDTO;
import com.school.management.dto.financial.FeesItemResponseDTO;

import java.util.List;

public interface FeesItemService {

    FeesItemResponseDTO create(FeesItemCreateDTO dto);
    // Nouvelles méthodes
    FeesItemResponseDTO update(Long id, FeesItemCreateDTO dto);
    void delete(Long id);

    List<FeesItemResponseDTO> getAll();

    List<FeesItemResponseDTO> getByFeesGroup(Long feesGroupId);
}
