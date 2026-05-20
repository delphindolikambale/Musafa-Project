package com.school.management.service.academic;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;

import java.util.List;

public interface LevelService {

    LevelDTO create(LevelCreateDTO dto);

    List<LevelDTO> getAll();

    LevelDTO getById(Long id);

    // Nouveaux compléments
    LevelDTO update(Long id, LevelCreateDTO dto);
    void delete(Long id);
}
