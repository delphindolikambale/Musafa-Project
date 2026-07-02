package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DomainRequestDTO;
import com.school.management.dto.academic.DomainResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Domain;
import com.school.management.model.academic.Level;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.DomainService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
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
    private final DomainSpecialityRepository specialityRepository;

    /**
     * ✅ MÉTHODE UTILITAIRE PRIVÉE SÉCURISÉE
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session utilisateur invalide ou expirée. Veuillez vous reconnecter.");
        }
        return (UserDetailsImpl) principal;
    }

    /**
     * ✅ MÉTHODE UTILITAIRE PRIVÉE
     */
    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("Action impossible : Votre compte utilisateur n'est rattaché à aucune école.");
        }
        return getCurrentUser().getSchool().getId();
    }

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

        // ✅ CONTRÔLE DE SÉCURITÉ : L'année doit appartenir à la même école
        if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique spécifiée n'appartient pas à votre établissement.");
        }

        Domain domain = Domain.builder()
                .name(dto.getName())
                .orderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0)
                .level(level)
                .academicYear(year)
                .section(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null)
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Injection de l'école courante
                .build();

        if (dto.getRequiredSpecialityId() != null) {
            domain.setRequiredSpeciality(specialityRepository.findById(dto.getRequiredSpecialityId())
                    .orElseThrow(() -> new RuntimeException("Spécialité requise non trouvée")));
        }

        return mapToResponse(domainRepository.save(domain));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DomainResponseDTO> getDomainsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        // ✅ MULTI-TENANT : Filtrage sécurisé par l'école connectée
        return domainRepository.findByClassContext(levelId, sectionId, optionId, yearId, getCurrentSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DomainResponseDTO updateDomain(Long id, DomainRequestDTO dto) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé"));

        // ✅ CONTRÔLE DE SÉCURITÉ : Vérification multi-tenant
        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ce domaine n'appartient pas à votre établissement.");
        }

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
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        // ✅ CONTRÔLE DE SÉCURITÉ : Empêche la suppression transversale
        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ce domaine n'appartient pas à votre établissement.");
        }
        domainRepository.delete(domain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DomainResponseDTO> getAllDomains() {
        // ✅ MULTI-TENANT : Liste restreinte à l'école de la session
        return domainRepository.findAllBySchoolId(getCurrentSchoolId()).stream()
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