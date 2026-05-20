package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SubjectRequestDTO;
import com.school.management.dto.academic.SubjectResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public SubjectResponseDTO createSubject(SubjectRequestDTO dto) {
        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        SubDomain subDomain;

        // LOGIQUE : Si aucun sous-domaine n'est fourni, on utilise/crée le sous-domaine technique
        if (dto.getSubDomainId() == null) {
            subDomain = getOrCreateTechnicalSubDomain(domain, dto);
        } else {
            subDomain = subDomainRepository.findById(dto.getSubDomainId())
                    .orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));
        }

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

        Subject subject = Subject.builder()
                .name(dto.getName())
                .domain(domain)
                .subDomain(subDomain)
                .level(level)
                .academicYear(year)
                .section(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null)
                .option(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null)
                .build();

        return mapToResponse(subjectRepository.save(subject));
    }

    /**
     * Gère la création automatique du sous-domaine technique (fantôme)
     */
    private SubDomain getOrCreateTechnicalSubDomain(Domain domain, SubjectRequestDTO dto) {
        // On cherche s'il existe déjà un sous-domaine avec le même nom que le domaine pour cette classe
        return subDomainRepository.findByClassContext(
                        dto.getLevelId(), dto.getSectionId(), dto.getOptionId(), dto.getAcademicYearId())
                .stream()
                .filter(sd -> sd.getName().equalsIgnoreCase(domain.getName()))
                .findFirst()
                .orElseGet(() -> {
                    SubDomain techSd = SubDomain.builder()
                            .name(domain.getName())
                            .domain(domain)
                            .level(domain.getLevel())
                            .section(domain.getSection())
                            .option(domain.getOption())
                            .academicYear(domain.getAcademicYear())
                            .orderIndex(0)
                            .build();
                    return subDomainRepository.save(techSd);
                });
    }

    @Override
    @Transactional
    public SubjectResponseDTO updateSubject(Long id, SubjectRequestDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matière introuvable"));

        Domain domain = domainRepository.findById(dto.getDomainId())
                .orElseThrow(() -> new RuntimeException("Domaine introuvable"));

        SubDomain subDomain = (dto.getSubDomainId() == null)
                ? getOrCreateTechnicalSubDomain(domain, dto)
                : subDomainRepository.findById(dto.getSubDomainId()).orElseThrow(() -> new RuntimeException("Sous-domaine introuvable"));

        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Année introuvable"));

        subject.setName(dto.getName());
        subject.setDomain(domain);
        subject.setSubDomain(subDomain);
        subject.setLevel(level);
        subject.setAcademicYear(year);
        subject.setSection(dto.getSectionId() != null ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null);
        subject.setOption(dto.getOptionId() != null ? optionRepository.findById(dto.getOptionId()).orElse(null) : null);

        return mapToResponse(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : Matière introuvable"));
        subjectRepository.delete(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getSubjectsByClass(Long levelId, Long sectionId, Long optionId, Long yearId) {
        return subjectRepository.findByClassContext(levelId, sectionId, optionId, yearId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponseDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubjectResponseDTO mapToResponse(Subject s) {
        return SubjectResponseDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                .domainName(s.getDomain() != null ? s.getDomain().getName() : null)
                .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : null)
                .build();
    }
}