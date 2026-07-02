package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Section;
import com.school.management.model.multitenant.School;
import com.school.management.repository.academic.SectionRepository;
import com.school.management.service.academic.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SectionServiceImpl implements SectionService {

    private final SectionRepository sectionRepository;

    @Override
    @Transactional
    public Section create(SectionRequestDTO dto, School currentSchool) {
        if (sectionRepository.existsBySectionNameAndSchoolId(dto.getSectionName(), currentSchool.getId())) {
            throw new IllegalArgumentException("Cette section existe déjà dans votre établissement.");
        }

        Section section = Section.builder()
                .sectionName(dto.getSectionName())
                .active(true)
                .school(currentSchool)
                .build();

        return sectionRepository.save(section);
    }

    @Override
    public List<Section> getAll(Long schoolId) {
        return sectionRepository.findAllBySchoolId(schoolId);
    }

    @Override
    public Section getById(Long id, Long schoolId) {
        return sectionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Section introuvable avec l'ID : " + id));
    }

    @Override
    @Transactional
    public Section update(Long id, SectionRequestDTO dto, Long schoolId) {
        Section section = sectionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Impossible de modifier : Section introuvable ou accès non autorisé."));

        if (!section.getSectionName().equalsIgnoreCase(dto.getSectionName()) &&
                sectionRepository.existsBySectionNameAndSchoolId(dto.getSectionName(), schoolId)) {
            throw new IllegalArgumentException("Une autre section porte déjà ce nom au sein de votre établissement.");
        }

        section.setSectionName(dto.getSectionName());
        section.setActive(dto.isActive());

        return sectionRepository.save(section);
    }

    @Override
    @Transactional
    public void delete(Long id, Long schoolId) {
        Section section = sectionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Impossible de supprimer : Section introuvable ou non autorisée."));
        sectionRepository.delete(section);
    }
}