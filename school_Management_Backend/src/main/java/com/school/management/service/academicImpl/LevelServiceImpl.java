package com.school.management.service.academicImpl;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;
import com.school.management.model.academic.Level;
import com.school.management.repository.academic.LevelRepository;
import com.school.management.service.academic.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor

public class LevelServiceImpl implements LevelService {

    private final LevelRepository levelRepository;

    @Override
    @Transactional
    public LevelDTO create(LevelCreateDTO dto) {
        Level level = Level.builder()
                .name(dto.getName())
                .type(dto.getType())
                .active(dto.isActive()) // Utilise la valeur du DTO (true par défaut au front)
                .build();

        level = levelRepository.save(level);
        return toDTO(level);
    }

    @Override
    public List<LevelDTO> getAll() {
        return levelRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public LevelDTO getById(Long id) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable"));
        return toDTO(level);
    }

    @Override
    @Transactional
    public LevelDTO update(Long id, LevelCreateDTO dto) {
        Level level = levelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable avec l'ID: " + id));

        // Mise à jour des informations
        level.setName(dto.getName());
        level.setType(dto.getType());

        // --- LA CORRECTION EST ICI ---
        // On récupère enfin la valeur "active" envoyée par le bouton du Frontend
        level.setActive(dto.isActive());

        level = levelRepository.save(level);
        return toDTO(level);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!levelRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Niveau introuvable");
        }
        levelRepository.deleteById(id);
    }

    private LevelDTO toDTO(Level level) {
        return LevelDTO.builder()
                .id(level.getId())
                .name(level.getName())
                .type(level.getType())
                .active(level.isActive())
                .build();
    }
}
