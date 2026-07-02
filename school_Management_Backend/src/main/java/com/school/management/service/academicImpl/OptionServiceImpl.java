package com.school.management.service.academicImpl;

import com.school.management.dto.academic.OptionDTO;
import com.school.management.dto.academic.OptionRequestDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Option;
import com.school.management.model.academic.Section;
import com.school.management.repository.academic.OptionRepository;
import com.school.management.repository.academic.SectionRepository;
import com.school.management.service.academic.OptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OptionServiceImpl implements OptionService {
    private final OptionRepository optionRepository;
    private final SectionRepository sectionRepository;

    @Override
    @Transactional
    public Option create(OptionRequestDTO dto, Long schoolId) {
        // Validation et récupération de la section dans le périmètre multi-tenant de l'école
        Section section = sectionRepository.findByIdAndSchoolId(dto.getSectionId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Section parente introuvable dans votre établissement."));

        if (optionRepository.existsByOptionNameAndSectionAndSchoolId(dto.getOptionName(), section, schoolId)) {
            throw new IllegalArgumentException("Cette option existe déjà dans cette section au sein de votre école.");
        }

        // ✅ LOGIQUE ALIGNÉE : On construit l'entité en récupérant l'objet School depuis la section parente valide
        Option option = Option.builder()
                .optionName(dto.getOptionName())
                .section(section)
                .active(true)
                .school(section.getSchool())
                .build();

        return optionRepository.save(option);
    }

    @Override
    public List<Option> getAll(Long schoolId) {
        return optionRepository.findAllBySchoolId(schoolId);
    }

    @Override
    public Option getById(Long id, Long schoolId) {
        return optionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Option introuvable ou accès restreint."));
    }

    @Override
    public List<Option> getBySection(Long sectionId, Long schoolId) {
        return optionRepository.findBySectionIdAndSchoolId(sectionId, schoolId);
    }

    @Override
    @Transactional
    public OptionDTO update(Long id, OptionRequestDTO dto, Long schoolId) {
        Option option = optionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Option introuvable ou non autorisée."));

        Section section = sectionRepository.findByIdAndSchoolId(dto.getSectionId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Section parente introuvable dans votre établissement."));

        option.setOptionName(dto.getOptionName());
        option.setSection(section);
        option.setActive(dto.isActive());

        Option updatedOption = optionRepository.save(option);
        return toDTO(updatedOption);
    }

    @Override
    @Transactional
    public void delete(Long id, Long schoolId) {
        Option option = optionRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Impossible de supprimer : Option introuvable ou accès refusé."));
        optionRepository.delete(option);
    }

    private OptionDTO toDTO(Option option) {
        return OptionDTO.builder()
                .id(option.getId())
                .optionName(option.getOptionName())
                .sectionId(option.getSection().getId())
                .sectionName(option.getSection().getSectionName())
                .active(option.isActive())
                .build();
    }
}