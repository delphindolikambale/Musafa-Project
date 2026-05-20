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
    public Option create(OptionRequestDTO dto) {
        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section introuvable"));

        if (optionRepository.existsByOptionNameAndSection(dto.getOptionName(), section)) {
            throw new IllegalArgumentException("Cette option existe déjà dans cette section");
        }

        Option option = Option.builder()
                .optionName(dto.getOptionName())
                .section(section)
                .active(true)
                .build();

        return optionRepository.save(option);
    }

    @Override
    public List<Option> getAll() {
        return optionRepository.findAll();
    }

    @Override
    public Option getById(Long id) {
        return optionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Option introuvable"));
    }

    @Override
    public List<Option> getBySection(Long sectionId) {
        // On appelle directement la méthode que vous avez créée dans OptionRepository
        return optionRepository.findBySectionId(sectionId);
    }

    // NOUVELLE MÉTHODE : UPDATE (Règle l'erreur du Controller)
    @Override
    @Transactional
    public OptionDTO update(Long id, OptionRequestDTO dto) {
        Option option = optionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Option introuvable"));

        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section parente introuvable"));

        // Mise à jour des champs
        option.setOptionName(dto.getOptionName());
        option.setSection(section);
        option.setActive(dto.isActive()); // isActive() ne sera plus rouge si @Data est sur le DTO

        Option updatedOption = optionRepository.save(option);
        return toDTO(updatedOption); // On retourne un DTO pour le Controller
    }

    // ✅ NOUVELLE MÉTHODE : DELETE
    @Override
    @Transactional
    public void delete(Long id) {
        if (!optionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Impossible de supprimer : Option introuvable");
        }
        optionRepository.deleteById(id);
    }

    // 🔄 MÉTHODE UTILITAIRE : Convertir Entité vers DTO
    private OptionDTO toDTO(Option option) {
        return OptionDTO.builder()
                .id(option.getId())
                .optionName(option.getOptionName())
                .sectionId(option.getSection().getId())
                .sectionName(option.getSection().getSectionName()) // Pour l'affichage Front
                .active(option.isActive())
                .build();
    }
}
