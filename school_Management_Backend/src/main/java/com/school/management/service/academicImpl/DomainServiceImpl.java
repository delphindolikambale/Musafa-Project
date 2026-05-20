package com.school.management.service.academicImpl;
import com.school.management.dto.academic.DomainRequestDTO;
import com.school.management.dto.academic.DomainResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Domain;
import com.school.management.model.academic.Level;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class DomainServiceImpl implements DomainService {

    private final DomainRepository domainRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final DomainSpecialityRepository specialityRepository; // Injection nécessaire

    @Override
    @Transactional
    public DomainResponseDTO createDomain(DomainRequestDTO dto) {
        if (dto.getLevelId() == null) {
            throw new RuntimeException("Le niveau (level_id) est obligatoire.");
        }
        if (dto.getAcademicYearId() == null) {
            throw new RuntimeException("L'année académique est obligatoire.");
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année non trouvée"));

        Domain domain = Domain.builder()
                .name(dto.getName())
                .orderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0)
                .level(level)
                .academicYear(year)
                .section(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null)
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .build();

        // Liaison de la spécialité si l'ID est fourni
        if (dto.getRequiredSpecialityId() != null) {
            domain.setRequiredSpeciality(specialityRepository.findById(dto.getRequiredSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Spécialité requise non trouvée")));
        }

        return mapToResponse(domainRepository.save(domain));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DomainResponseDTO> getDomainsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        return domainRepository.findByClassContext(levelId, sectionId, optionId, yearId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DomainResponseDTO updateDomain(Long id, DomainRequestDTO dto) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé"));

        domain.setName(dto.getName());
        if (dto.getOrderIndex() != null) {
            domain.setOrderIndex(dto.getOrderIndex());
        }

        if (dto.getRequiredSpecialityId() != null) {
            domain.setRequiredSpeciality(specialityRepository.findById(dto.getRequiredSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Spécialité requise non trouvée")));
        } else {
            domain.setRequiredSpeciality(null);
        }

        return mapToResponse(domainRepository.save(domain));
    }

    @Override
    @Transactional
    public void deleteDomain(Long id) {
        if (!domainRepository.existsById(id)) {
            throw new RuntimeException("Domaine introuvable");
        }
        domainRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DomainResponseDTO> getAllDomains() {
        return domainRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DomainResponseDTO mapToResponse(Domain domain) {
        DomainResponseDTO dto = DomainResponseDTO.builder()
                .id(domain.getId())
                .name(domain.getName())
                .orderIndex(domain.getOrderIndex())
                .levelId(domain.getLevel() != null ? domain.getLevel().getId() : null)
                .levelName(domain.getLevel() != null ? domain.getLevel().getName() : null)
                .sectionId(domain.getSection() != null ? domain.getSection().getId() : null)
                .optionId(domain.getOption() != null ? domain.getOption().getId() : null)
                .academicYearId(domain.getAcademicYear() != null ? domain.getAcademicYear().getId() : null)
                .build();

        if (domain.getRequiredSpeciality() != null) {
            dto.setRequiredSpecialityId(domain.getRequiredSpeciality().getId());
            dto.setRequiredSpecialityName(domain.getRequiredSpeciality().getName());
        }

        return dto;
    }
}
