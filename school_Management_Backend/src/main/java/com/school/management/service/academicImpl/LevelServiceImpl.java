package com.school.management.service.academicImpl;

import com.school.management.dto.academic.LevelCreateDTO;
import com.school.management.dto.academic.LevelDTO;
import com.school.management.model.academic.Level;
import com.school.management.model.multitenant.School;
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
    public LevelDTO create(LevelCreateDTO dto, Long schoolId) {
        // ✅ ADAPTATION MULTI-TENANT : Utilisation directe du schoolId pour la vérification d'existence
        if (levelRepository.existsByNameAndSchoolId(dto.getName(), schoolId)) {
            throw new IllegalArgumentException("Ce niveau d'enseignement existe déjà dans votre établissement.");
        }

        // ✅ ASTUCE JPA : Reconstruction d'une référence d'école superficielle (shallow) avec l'ID pour la clé étrangère
        School currentSchool = School.builder()
                .id(schoolId)
                .build();

        Level level = Level.builder()
                .name(dto.getName())
                .type(dto.getType())
                .active(dto.isActive())
                .school(currentSchool)
                .build();

        level = levelRepository.save(level);
        return toDTO(level);
    }

    @Override
    public List<LevelDTO> getAll(Long schoolId) {
        return levelRepository.findAllBySchoolId(schoolId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public LevelDTO getById(Long id, Long schoolId) {
        Level level = levelRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable ou accès non autorisé."));
        return toDTO(level);
    }

    @Override
    @Transactional
    public LevelDTO update(Long id, LevelCreateDTO dto, Long schoolId) {
        Level level = levelRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable avec l'ID: " + id));

        if (!level.getName().equalsIgnoreCase(dto.getName()) &&
                levelRepository.existsByNameAndSchoolId(dto.getName(), schoolId)) {
            throw new IllegalArgumentException("Un autre niveau porte déjà ce nom dans votre établissement.");
        }

        level.setName(dto.getName());
        level.setType(dto.getType());
        level.setActive(dto.isActive());

        level = levelRepository.save(level);
        return toDTO(level);
    }

    @Override
    @Transactional
    public void delete(Long id, Long schoolId) {
        Level level = levelRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : Niveau introuvable ou accès refusé."));
        levelRepository.delete(level);
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