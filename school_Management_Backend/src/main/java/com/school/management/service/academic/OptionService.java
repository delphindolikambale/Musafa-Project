package com.school.management.service.academic;

import com.school.management.dto.academic.OptionDTO;
import com.school.management.dto.academic.OptionRequestDTO;
import com.school.management.model.academic.Option;

import java.util.List;

public interface OptionService {
    // ✅ ADAPTATION : Reçoit désormais Long schoolId pour s'aligner sur le contrôleur
    Option create(OptionRequestDTO dto, Long schoolId);

    List<Option> getAll(Long schoolId);

    Option getById(Long id, Long schoolId);

    List<Option> getBySection(Long sectionId, Long schoolId);

    OptionDTO update(Long id, OptionRequestDTO dto, Long schoolId);

    void delete(Long id, Long schoolId);
}