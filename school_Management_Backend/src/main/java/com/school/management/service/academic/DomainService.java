package com.school.management.service.academic;

import com.school.management.dto.academic.DomainRequestDTO;
import com.school.management.dto.academic.DomainResponseDTO;

import java.util.List;
public interface DomainService {
    DomainResponseDTO createDomain(DomainRequestDTO dto);

    // Récupère uniquement les domaines de la classe sélectionnée
    List<DomainResponseDTO> getDomainsByClass(Long levelId, Long sectionId, Long optionId, Long yearId);

    DomainResponseDTO updateDomain(Long id, DomainRequestDTO dto);

    void deleteDomain(Long id);

    List<DomainResponseDTO> getAllDomains();
}
