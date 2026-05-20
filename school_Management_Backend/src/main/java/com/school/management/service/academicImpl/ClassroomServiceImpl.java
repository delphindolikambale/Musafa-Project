package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.repository.academic.*;
import com.school.management.service.academic.ClassroomService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional

public class ClassroomServiceImpl implements ClassroomService{

    private final ClassroomRepository classroomRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final RoomRepository roomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AcademicYearRepository academicYearRepository;

    @Override
    public ClassroomResponseDTO create(ClassroomRequestDTO request) {
        if (classroomRepository.existsByLevelIdAndSectionIdAndOptionIdAndDivision(
                request.getLevelId(), request.getSectionId(), request.getOptionId(), request.getDivision())) {
            throw new RuntimeException("Cette classe existe déjà avec cette division.");
        }
        validateRoomAvailability(request.getRoomId(), null);

        Classroom classroom = new Classroom();
        updateEntityFromDTO(classroom, request);
        classroom.setActive(true);

        return convertToDTO(classroomRepository.save(classroom), null);
    }

    @Override
    public ClassroomResponseDTO updateClassroom(Long id, ClassroomRequestDTO request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe introuvable (ID: " + id + ")"));

        classroomRepository.findByLevelIdAndSectionIdAndOptionIdAndDivision(
                        request.getLevelId(), request.getSectionId(), request.getOptionId(), request.getDivision())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Une autre classe avec ces caractéristiques existe déjà.");
                    }
                });

        validateRoomAvailability(request.getRoomId(), id);
        updateEntityFromDTO(classroom, request);

        return convertToDTO(classroomRepository.save(classroom), null);
    }

    // --- MÉTHODES DE RÉCUPÉRATION AVEC FILTRAGE ---

    @Override
    public List<ClassroomResponseDTO> getAll(Long academicYearId) {
        return classroomRepository.findAll().stream()
                .map(entity -> convertToDTO(entity, academicYearId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomResponseDTO> getAllActive(Long academicYearId) {
        return classroomRepository.findByActiveTrue().stream()
                .map(entity -> convertToDTO(entity, academicYearId))
                .collect(Collectors.toList());
    }

    @Override
    public ClassroomResponseDTO getById(Long id, Long academicYearId) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));
        return convertToDTO(classroom, academicYearId);
    }

    @Override
    public List<ClassroomResponseDTO> getByLevel(Long levelId, Long academicYearId) {
        return classroomRepository.findByLevelId(levelId).stream()
                .map(entity -> convertToDTO(entity, academicYearId))
                .collect(Collectors.toList());
    }

    // --- COMPATIBILITÉ (Surcharge pour appeler les versions avec année) ---

    @Override public List<ClassroomResponseDTO> getAll() { return getAll(null); }
    @Override public List<ClassroomResponseDTO> getAllActive() { return getAllActive(null); }
    @Override public ClassroomResponseDTO getById(Long id) { return getById(id, null); }
    @Override public List<ClassroomResponseDTO> getByLevel(Long levelId) { return getByLevel(levelId, null); }

    // --- LOGIQUE INTERNE ---

    private void validateRoomAvailability(Long roomId, Long currentClassroomId) {
        classroomRepository.findByRoomId(roomId).ifPresent(existingClass -> {
            if (currentClassroomId == null || !existingClass.getId().equals(currentClassroomId)) {
                throw new RuntimeException("La salle " + existingClass.getRoom().getName() + " est déjà occupée par la classe " + existingClass.getDisplayName());
            }
        });
    }

    private void updateEntityFromDTO(Classroom classroom, ClassroomRequestDTO request) {
        classroom.setLevel(levelRepository.findById(request.getLevelId()).orElseThrow(() -> new RuntimeException("Niveau introuvable")));
        classroom.setRoom(roomRepository.findById(request.getRoomId()).orElseThrow(() -> new RuntimeException("Salle physique introuvable")));
        classroom.setSection(request.getSectionId() != null ? sectionRepository.findById(request.getSectionId()).orElse(null) : null);
        classroom.setOption(request.getOptionId() != null ? optionRepository.findById(request.getOptionId()).orElse(null) : null);
        classroom.setDivision(request.getDivision() != null && !request.getDivision().trim().isEmpty() ? request.getDivision().trim().toUpperCase() : null);
    }

    private ClassroomResponseDTO convertToDTO(Classroom entity, Long academicYearId) {
        ClassroomResponseDTO dto = new ClassroomResponseDTO();
        // ... (Mapping des champs de base identique)
        dto.setId(entity.getId());
        dto.setLevelName(entity.getLevel().getName());
        dto.setSectionName(entity.getSection() != null ? entity.getSection().getSectionName() : "Tronc Commun");
        dto.setOptionName(entity.getOption() != null ? entity.getOption().getOptionName() : "Aucune");
        dto.setDivision(entity.getDivision());
        dto.setRoomName(entity.getRoom() != null ? entity.getRoom().getName() : "N/A");
        dto.setCapacity(entity.getRoom() != null ? entity.getRoom().getCapacity() : 0);
        dto.setDisplayName(entity.getDisplayName());
        dto.setActive(entity.isActive());
        dto.setLevelId(entity.getLevel().getId());
        dto.setRoomId(entity.getRoom() != null ? entity.getRoom().getId() : null);
        dto.setSectionId(entity.getSection() != null ? entity.getSection().getId() : null);
        dto.setOptionId(entity.getOption() != null ? entity.getOption().getId() : null);

        // ✅ FILTRAGE : Si aucune année n'est passée, on prend l'active
        Long yearToFilter = academicYearId;
        if (yearToFilter == null) {
            yearToFilter = academicYearRepository.findByActiveTrue()
                    .map(AcademicYear::getId)
                    .orElse(null);
        }

        // ✅ COMPTAGE RÉEL : On ne compte que les inscriptions liées à cette année spécifique
        if (yearToFilter != null) {
            long count = enrollmentRepository.countByClassroomIdAndAcademicYearId(entity.getId(), yearToFilter);
            dto.setCurrentStudents((int) count);
        } else {
            dto.setCurrentStudents(0);
        }

        return dto;
    }

    @Override
    public void delete(Long id) {
        if (!classroomRepository.existsById(id)) throw new RuntimeException("Impossible de supprimer : classe inexistante");
        classroomRepository.deleteById(id);
    }

    @Override
    public void toggleStatus(Long id) {
        Classroom classroom = classroomRepository.findById(id).orElseThrow(() -> new RuntimeException("Classe introuvable"));
        classroom.setActive(!classroom.isActive());
        classroomRepository.save(classroom);
    }
}
