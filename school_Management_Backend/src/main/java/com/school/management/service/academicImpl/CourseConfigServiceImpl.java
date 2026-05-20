package com.school.management.service.academicImpl;
import com.school.management.dto.academic.CourseAssignmentRequestDTO;
import com.school.management.dto.academic.CourseAssignmentResponseDTO;
import com.school.management.dto.academic.ImportConfigRequestDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.CourseConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class CourseConfigServiceImpl implements CourseConfigService {

    private final CourseAssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final AcademicYearRepository yearRepository;
    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;

    @Override
    @Transactional
    public void importConfigurationFromPreviousYear(ImportConfigRequestDTO dto) {
        List<CourseAssignment> existing = assignmentRepository.findByPedagogicalKey(
                dto.getLevelId(), dto.getSectionId(), dto.getOptionId(), dto.getTargetYearId());

        if (!existing.isEmpty()) {
            throw new RuntimeException("Une configuration existe déjà pour l'année cible.");
        }

        List<CourseAssignment> sourceAssignments = assignmentRepository.findByPedagogicalKey(
                dto.getLevelId(), dto.getSectionId(), dto.getOptionId(), dto.getSourceYearId());

        AcademicYear targetYear = yearRepository.findById(dto.getTargetYearId())
                .orElseThrow(() -> new RuntimeException("Année cible non trouvée"));

        Map<Long, Domain> oldToNewDomainMap = new HashMap<>();
        Map<Long, SubDomain> oldToNewSubDomainMap = new HashMap<>();

        for (CourseAssignment source : sourceAssignments) {
            Subject oldSubject = source.getSubject();
            Domain oldDomain = oldSubject.getDomain();
            SubDomain oldSubDomain = oldSubject.getSubDomain();

            // 1. Cloner le Domaine
            Domain newDomain = oldToNewDomainMap.computeIfAbsent(oldDomain.getId(), id -> {
                Domain d = Domain.builder()
                        .name(oldDomain.getName())
                        .orderIndex(oldDomain.getOrderIndex())
                        .level(source.getLevel())
                        .section(source.getSection())
                        .option(source.getOption())
                        .academicYear(targetYear)
                        .build();
                return domainRepository.save(d);
            });

            // 2. Cloner le Sous-Domaine (Obligatoire dans notre logique technique)
            SubDomain newSubDomain = null;
            if (oldSubDomain != null) {
                newSubDomain = oldToNewSubDomainMap.computeIfAbsent(oldSubDomain.getId(), id -> {
                    SubDomain sd = SubDomain.builder()
                            .name(oldSubDomain.getName())
                            .domain(newDomain)
                            .orderIndex(oldSubDomain.getOrderIndex())
                            .level(source.getLevel())
                            .section(source.getSection())
                            .option(source.getOption())
                            .academicYear(targetYear)
                            .build();
                    return subDomainRepository.save(sd);
                });
            }

            // 3. Cloner le Sujet (Cours)
            Subject newSubject = Subject.builder()
                    .name(oldSubject.getName())
                    .domain(newDomain)
                    .subDomain(newSubDomain)
                    .level(source.getLevel())
                    .section(source.getSection())
                    .option(source.getOption())
                    .academicYear(targetYear)
                    .build();
            Subject savedSubject = subjectRepository.save(newSubject);

            // 4. Cloner l'affectation finale (Maxima)
            CourseAssignment newAssignment = CourseAssignment.builder()
                    .subject(savedSubject)
                    .level(source.getLevel())
                    .section(source.getSection())
                    .option(source.getOption())
                    .academicYear(targetYear)
                    .maxP1(source.getMaxP1())
                    .maxP2(source.getMaxP2())
                    .maxExam1(source.getMaxExam1())
                    .maxP3(source.getMaxP3())
                    .maxP4(source.getMaxP4())
                    .maxExam2(source.getMaxExam2())
                    .build();

            assignmentRepository.save(newAssignment);
        }
    }

    @Override
    @Transactional
    public CourseAssignment configureCourse(CourseAssignmentRequestDTO dto) {
        validateMaximas(dto);
        Subject subject = subjectRepository.findById(dto.getSubjectId()).orElseThrow(() -> new RuntimeException("Sujet non trouvé"));
        Level level = levelRepository.findById(dto.getLevelId()).orElseThrow(() -> new RuntimeException("Niveau non trouvé"));
        AcademicYear year = yearRepository.findById(dto.getAcademicYearId()).orElseThrow(() -> new RuntimeException("Année scolaire non trouvée"));

        Section section = (dto.getSectionId() != null) ? sectionRepository.findById(dto.getSectionId()).orElse(null) : null;
        Option option = (dto.getOptionId() != null) ? optionRepository.findById(dto.getOptionId()).orElse(null) : null;

        CourseAssignment config = CourseAssignment.builder()
                .subject(subject)
                .level(level)
                .section(section)
                .option(option)
                .academicYear(year)
                .maxP1(dto.getMaxP1())
                .maxP2(dto.getMaxP2())
                .maxExam1(dto.getMaxP1() + dto.getMaxP2())
                .maxP3(dto.getMaxP3())
                .maxP4(dto.getMaxP4())
                .maxExam2(dto.getMaxP3() + dto.getMaxP4())
                .build();

        return assignmentRepository.save(config);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseAssignmentResponseDTO> getPedagogicalConfiguration(Long levelId, Long sectionId, Long optionId, Long yearId) {
        return assignmentRepository.findByPedagogicalKey(levelId, sectionId, optionId, yearId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseAssignment updateCourseConfig(Long id, CourseAssignmentRequestDTO dto) {
        validateMaximas(dto);
        CourseAssignment config = assignmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Configuration non trouvée"));
        config.setMaxP1(dto.getMaxP1());
        config.setMaxP2(dto.getMaxP2());
        config.setMaxExam1(dto.getMaxP1() + dto.getMaxP2());
        config.setMaxP3(dto.getMaxP3());
        config.setMaxP4(dto.getMaxP4());
        config.setMaxExam2(dto.getMaxP3() + dto.getMaxP4());
        return assignmentRepository.save(config);
    }

    @Override
    @Transactional
    public void deleteCourseConfig(Long id) {
        assignmentRepository.deleteById(id);
    }

    private void validateMaximas(CourseAssignmentRequestDTO dto) {
        if (dto.getMaxP1() < 0 || dto.getMaxP2() < 0 || dto.getMaxP3() < 0 || dto.getMaxP4() < 0) {
            throw new RuntimeException("Les maxima ne peuvent pas être négatifs.");
        }
    }

    private CourseAssignmentResponseDTO convertToDTO(CourseAssignment entity) {
        Subject s = entity.getSubject();
        return CourseAssignmentResponseDTO.builder()
                .id(entity.getId())
                .subjectId(s.getId())
                .subjectName(s.getName())
                .domainId(s.getDomain() != null ? s.getDomain().getId() : null)
                .domainName(s.getDomain() != null ? s.getDomain().getName() : "SANS DOMAINE")
                .subDomainId(s.getSubDomain() != null ? s.getSubDomain().getId() : null)
                .subDomainName(s.getSubDomain() != null ? s.getSubDomain().getName() : "SANS SOUS-DOMAINE")
                .levelId(entity.getLevel().getId())
                .levelName(entity.getLevel().getName())
                .maxP1(entity.getMaxP1())
                .maxP2(entity.getMaxP2())
                .maxExam1(entity.getMaxExam1())
                .maxP3(entity.getMaxP3())
                .maxP4(entity.getMaxP4())
                .maxExam2(entity.getMaxExam2())
                .maxS1(entity.getMaxS1())
                .maxS2(entity.getMaxS2())
                .maxTotal(entity.getMaxTotal())
                .build();
    }
}
