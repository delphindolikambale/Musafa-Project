package com.school.management.service.academic;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;

import java.util.List;

public interface LevelService {

    // ✅ ADAPTATION : Remplacement de l'entité School par Long schoolId pour s'aligner sur le contrôleur
    LevelDTO create(LevelCreateDTO dto, Long schoolId);

    List<LevelDTO> getAll(Long schoolId);

    LevelDTO getById(Long id, Long schoolId);

    LevelDTO update(Long id, LevelCreateDTO dto, Long schoolId);

    void delete(Long id, Long schoolId);
}