package com.school.management.service.academic;
import com.school.management.dto.academic.SubDomainRequestDTO;
import com.school.management.dto.academic.SubDomainResponseDTO;
import java.util.List;

public interface SubDomainService {
    SubDomainResponseDTO createSubDomain(SubDomainRequestDTO dto);

    /**
     * Récupère les sous-domaines spécifiques à une classe donnée.
     */
    List<SubDomainResponseDTO> getSubDomainsByClass(Long levelId, Long sectionId, Long optionId, Long yearId);

    List<SubDomainResponseDTO> getByDomain(Long domainId);

    List<SubDomainResponseDTO> getAllSubDomains();

    SubDomainResponseDTO updateSubDomain(Long id, SubDomainRequestDTO dto);

    void deleteSubDomain(Long id);
}
