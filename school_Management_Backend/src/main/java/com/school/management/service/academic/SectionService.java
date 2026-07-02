package com.school.management.service.academic;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.model.academic.Section;
import com.school.management.model.multitenant.School;

import java.util.List;

public interface SectionService {
    Section create(SectionRequestDTO dto, School currentSchool);

    List<Section> getAll(Long schoolId);

    Section getById(Long id, Long schoolId);

    Section update(Long id, SectionRequestDTO dto, Long schoolId);

    void delete(Long id, Long schoolId);
}