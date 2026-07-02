package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SubDomainRequestDTO;
import com.school.management.dto.academic.SubDomainResponseDTO;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Domain;
import com.school.management.model.academic.Level;
import com.school.management.model.academic.SubDomain;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.SubDomainService;
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
public class SubDomainServiceImpl implements SubDomainService {

    private final SubDomainRepository subDomainRepository;
    private final DomainRepository domainRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final AcademicYearRepository academicYearRepository;

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
    public SubDomainResponseDTO createSubDomain(SubDomainRequestDTO dto) {
        if (dto.getDomainId() == null) throw new RuntimeException("L'identifiant du domaine parent est obligatoire.");
        if (dto.getLevelId() == null) throw new RuntimeException("L'identifiant du niveau est obligatoire.");
        if (dto.getAcademicYearId() == null) throw new RuntimeException("L'identifiant de l'année académique est obligatoire.");

        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine Parent non trouvé"));

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année non trouvée"));

        // ✅ CONTRÔLE DE SÉCURITÉ : Interdiction d'affecter des structures d'un autre établissement
        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Le domaine parent sélectionné n'appartient pas à votre établissement.");
        }
        if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique n'appartient pas à votre établissement.");
        }

        SubDomain subDomain = SubDomain.builder()
                .name(dto.getName())
                .domain(domain)
                .orderIndex(dto.getOrderIndex())
                .level(level)
                .academicYear(year)
                .section(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null)
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Enregistrement de l'école
                .build();

        return mapToResponse(subDomainRepository.save(subDomain));
    }

    @Override
    @Transactional
    public SubDomainResponseDTO updateSubDomain(Long id, SubDomainRequestDTO dto) {
        if (id == null) throw new RuntimeException("L'identifiant du sous-domaine est obligatoire pour la modification.");

        SubDomain subDomain = subDomainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-domaine non trouvé"));

        // ✅ CONTRÔLE DE SÉCURITÉ : Propriété du sous-domaine courant
        if (!subDomain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ce sous-domaine n'appartient pas à votre établissement.");
        }

        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine Parent non trouvé"));

        // ✅ CONTRÔLE DE SÉCURITÉ : Propriété du nouveau domaine ciblé
        if (!domain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Le domaine cible n'appartient pas à votre établissement.");
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau non trouvé"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année non trouvée"));

        if (!year.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique n'appartient pas à votre établissement.");
        }

        subDomain.setName(dto.getName());
        subDomain.setDomain(domain);
        subDomain.setOrderIndex(dto.getOrderIndex());
        subDomain.setLevel(level);
        subDomain.setAcademicYear(year);
        subDomain.setSection(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null);
        subDomain.setOption(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null);

        return mapToResponse(subDomainRepository.save(subDomain));
    }

    @Override
    @Transactional
    public void deleteSubDomain(Long id) {
        SubDomain subDomain = subDomainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-domaine non trouvé"));

        // ✅ CONTRÔLE DE SÉCURITÉ
        if (!subDomain.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ce sous-domaine n'appartient pas à votre établissement.");
        }
        subDomainRepository.delete(subDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubDomainResponseDTO> getSubDomainsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        // ✅ MULTI-TENANT : Filtrage strict par l'école connectée
        return subDomainRepository.findByClassContext(levelId, sectionId, optionId, yearId, getCurrentSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubDomainResponseDTO> getByDomain(Long domainId) {
        // ✅ MULTI-TENANT + PERFORMANCE : Sécurisé en limitant le flux global aux données de l'école
        return subDomainRepository.findAllBySchoolId(getCurrentSchoolId()).stream()
                .filter(sd -> sd.getDomain() != null && sd.getDomain().getId().equals(domainId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubDomainResponseDTO> getAllSubDomains() {
        // ✅ MULTI-TENANT : Liste restreinte à l'école de la session
        return subDomainRepository.findAllBySchoolId(getCurrentSchoolId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubDomainResponseDTO mapToResponse(SubDomain sd) {
        return SubDomainResponseDTO.builder()
                .id(sd.getId())
                .name(sd.getName())
                .domainId(sd.getDomain() != null ? sd.getDomain().getId() : null)
                .domainName(sd.getDomain() != null ? sd.getDomain().getName() : null)
                .orderIndex(sd.getOrderIndex())
                .levelId(sd.getLevel() != null ? sd.getLevel().getId() : null)
                .sectionId(sd.getSection() != null ? sd.getSection().getId() : null)
                .optionId(sd.getOption() != null ? sd.getOption().getId() : null)
                .academicYearId(sd.getAcademicYear() != null ? sd.getAcademicYear().getId() : null)
                .build();
    }
}