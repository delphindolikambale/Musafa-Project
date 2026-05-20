package com.school.management.service.academic;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.model.academic.Section;

import java.util.List;

public interface SectionService {
    Section create(SectionRequestDTO dto);

    List<Section> getAll();
    Section getById(Long id);

    Section update(Long id, SectionRequestDTO dto);
    void delete(Long id);
}
