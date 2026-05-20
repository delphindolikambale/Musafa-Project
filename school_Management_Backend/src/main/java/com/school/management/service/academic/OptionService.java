package com.school.management.service.academic;

import com.school.management.dto.academic.OptionDTO;
import com.school.management.dto.academic.OptionRequestDTO;
import com.school.management.model.academic.Option;

import java.util.List;

public interface OptionService {
    Option create(OptionRequestDTO dto);

    List<Option> getAll();
    Option getById(Long id);

    // ✅ Ajoutez cette ligne :
    List<Option> getBySection(Long sectionId);

    OptionDTO update(Long id, OptionRequestDTO dto); // Retourne un DTO pour le Controller
    void delete(Long id);

}
