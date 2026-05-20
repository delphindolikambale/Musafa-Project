package com.school.management.service.academic;

import com.school.management.dto.academic.DomainSpecialityCreateDTO;
import com.school.management.dto.academic.DomainSpecialityResponseDTO;

import java.util.List;

public interface DomainSpecialityService {

    DomainSpecialityResponseDTO create(DomainSpecialityCreateDTO dto);
    List<DomainSpecialityResponseDTO> getAll();
    DomainSpecialityResponseDTO getById(Long id);
    void delete(Long id);
}
