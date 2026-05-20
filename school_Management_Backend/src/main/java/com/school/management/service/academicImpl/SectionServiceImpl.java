package com.school.management.service.academicImpl;

import com.school.management.dto.academic.SectionRequestDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.Section;
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
    public Section create(SectionRequestDTO dto) {
        if (sectionRepository.existsBySectionName(dto.getSectionName())) {
            throw new IllegalArgumentException("Cette section existe déjà");
        }

        Section section = Section.builder()
                .sectionName(dto.getSectionName())
                .active(true)
                .build();

        return sectionRepository.save(section);
    }

    @Override
    public List<Section> getAll() {
        return sectionRepository.findAll();
    }

    @Override
    public Section getById(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section introuvable avec l'ID : " + id));
    }

    // --- NOUVELLES MÉTHODES AJOUTÉES ---

    @Override
    @Transactional
    public Section update(Long id, SectionRequestDTO dto) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Impossible de modifier : Section introuvable"));

        // Vérification si le nouveau nom existe déjà pour une autre section
        if (!section.getSectionName().equalsIgnoreCase(dto.getSectionName()) &&
                sectionRepository.existsBySectionName(dto.getSectionName())) {
            throw new IllegalArgumentException("Une autre section porte déjà ce nom");
        }

        section.setSectionName(dto.getSectionName());
        // On permet aussi de mettre à jour le statut actif si le DTO le prévoit
        section.setActive(dto.isActive());

        return sectionRepository.save(section);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Impossible de supprimer : Section introuvable");
        }
        // Attention : Spring Data lancera une exception si des 'Options' sont liées à cette section
        sectionRepository.deleteById(id);
    }
}