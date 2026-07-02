package com.school.management.service.academicImpl;

import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.model.academic.*;
import com.school.management.model.multitenant.School;
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
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final LevelRepository levelRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;
    private final RoomRepository roomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TeacherRepository teacherRepository;

    // ✅ Adapté : Signature modifiée pour accepter Long schoolId
    @Override
    public ClassroomResponseDTO create(ClassroomRequestDTO request, Long schoolId) {
        if (classroomRepository.existsByLevelIdAndSectionIdAndOptionIdAndDivisionAndSchoolId(
                request.getLevelId(), request.getSectionId(), request.getOptionId(), request.getDivision(), schoolId)) {
            throw new RuntimeException("Cette classe existe déjà avec cette division dans votre établissement.");
        }
        validateRoomAvailability(request.getRoomId(), null, schoolId);

        Classroom classroom = new Classroom();
        // ✅ Association de l'école via son ID grâce au Builder Lombok
        classroom.setSchool(School.builder().id(schoolId).build());
        updateEntityFromDTO(classroom, request, schoolId);
        classroom.setActive(true);

        return convertToDTO(classroomRepository.save(classroom), null, schoolId);
    }

    @Override
    public ClassroomResponseDTO updateClassroom(Long id, ClassroomRequestDTO request, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable (ID: " + id + ") ou accès non autorisé."));

        classroomRepository.findByLevelIdAndSectionIdAndOptionIdAndDivisionAndSchoolId(
                        request.getLevelId(), request.getSectionId(), request.getOptionId(), request.getDivision(), schoolId)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Une autre classe avec ces caractéristiques existe déjà dans votre établissement.");
                    }
                });

        validateRoomAvailability(request.getRoomId(), id, schoolId);
        updateEntityFromDTO(classroom, request, schoolId);

        return convertToDTO(classroomRepository.save(classroom), null, schoolId);
    }

    @Override
    public void assignTitulaire(Long classroomId, Long teacherId, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé."));

        Teacher teacher = teacherRepository.findById(teacherId) // Note: Sera scopé lors du module RH
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

        if (!teacher.isActive()) {
            throw new RuntimeException("Impossible d'affecter un enseignant inactif comme titulaire.");
        }

        classroomRepository.findByTitulaireIdAndSchoolId(teacherId, schoolId).ifPresent(existingClass -> {
            if (!existingClass.getId().equals(classroomId)) {
                throw new RuntimeException("L'enseignant " + teacher.getFullName() +
                        " est déjà titulaire de la classe : " + existingClass.getDisplayName());
            }
        });

        classroom.setTitulaire(teacher);
        classroomRepository.save(classroom);
    }

    @Override
    public void removeTitulaire(Long classroomId, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(classroomId, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès non autorisé."));

        classroom.setTitulaire(null);
        classroomRepository.save(classroom);
    }

    @Override
    public List<ClassroomResponseDTO> getAll(Long academicYearId, Long schoolId) {
        return classroomRepository.findAllBySchoolId(schoolId).stream()
                .map(entity -> convertToDTO(entity, academicYearId, schoolId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ClassroomResponseDTO> getAllActive(Long academicYearId, Long schoolId) {
        return classroomRepository.findByActiveTrueAndSchoolId(schoolId).stream()
                .map(entity -> convertToDTO(entity, academicYearId, schoolId))
                .collect(Collectors.toList());
    }

    @Override
    public ClassroomResponseDTO getById(Long id, Long academicYearId, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable"));
        return convertToDTO(classroom, academicYearId, schoolId);
    }

    @Override
    public List<ClassroomResponseDTO> getByLevel(Long levelId, Long academicYearId, Long schoolId) {
        return classroomRepository.findByLevelIdAndSchoolId(levelId, schoolId).stream()
                .map(entity -> convertToDTO(entity, academicYearId, schoolId))
                .collect(Collectors.toList());
    }

    // --- COMPATIBILITÉ ET REDIRECTIONS MULTI-TENANT ---
    @Override public List<ClassroomResponseDTO> getAll(Long schoolId) { return getAll(null, schoolId); }
    @Override public List<ClassroomResponseDTO> getAllActive(Long schoolId) { return getAllActive(null, schoolId); }
    @Override public ClassroomResponseDTO getById(Long id, Long schoolId) { return getById(id, null, schoolId); }
    @Override public List<ClassroomResponseDTO> getByLevel(Long levelId, Long schoolId) { return getByLevel(levelId, null, schoolId); }

    // --- LOGIQUE INTERNE FILTRÉE ---
    private void validateRoomAvailability(Long roomId, Long currentClassroomId, Long schoolId) {
        classroomRepository.findByRoomIdAndSchoolId(roomId, schoolId).ifPresent(existingClass -> {
            if (currentClassroomId == null || !existingClass.getId().equals(currentClassroomId)) {
                throw new RuntimeException("La salle " + existingClass.getRoom().getName() + " est déjà occupée par la classe " + existingClass.getDisplayName());
            }
        });
    }

    private void updateEntityFromDTO(Classroom classroom, ClassroomRequestDTO request, Long schoolId) {
        classroom.setLevel(levelRepository.findByIdAndSchoolId(request.getLevelId(), schoolId)
                .orElseThrow(() -> new RuntimeException("Niveau introuvable dans votre établissement.")));
        classroom.setRoom(roomRepository.findById(request.getRoomId()) // Scoping Room ultérieur
                .orElseThrow(() -> new RuntimeException("Salle physique introuvable.")));
        classroom.setSection(request.getSectionId() != null ? sectionRepository.findByIdAndSchoolId(request.getSectionId(), schoolId).orElse(null) : null);
        classroom.setOption(request.getOptionId() != null ? optionRepository.findByIdAndSchoolId(request.getOptionId(), schoolId).orElse(null) : null);
        classroom.setDivision(request.getDivision() != null && !request.getDivision().trim().isEmpty() ? request.getDivision().trim().toUpperCase() : null);
    }

    private ClassroomResponseDTO convertToDTO(Classroom entity, Long academicYearId, Long schoolId) {
        ClassroomResponseDTO dto = new ClassroomResponseDTO();
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

        if (entity.getTitulaire() != null) {
            dto.setTitulaireId(entity.getTitulaire().getId());
            dto.setTitulaireName(entity.getTitulaire().getFullName());
        } else {
            dto.setTitulaireId(null);
            dto.setTitulaireName("Aucun titulaire assigné");
        }

        Long yearToFilter = academicYearId;
        if (yearToFilter == null) {
            yearToFilter = academicYearRepository.findByActiveTrueAndSchoolId(schoolId)
                    .map(AcademicYear::getId)
                    .orElse(null);
        }

        if (yearToFilter != null) {
            // ✅ CORRECTION MULTI-TENANT : Utilisation de la méthode contenant le paramètre schoolId
            long count = enrollmentRepository.countByClassroomIdAndAcademicYearIdAndSchoolId(entity.getId(), yearToFilter, schoolId);
            dto.setCurrentStudents((int) count);
        } else {
            dto.setCurrentStudents(0);
        }

        return dto;
    }

    @Override
    public void delete(Long id, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : classe inexistante ou non autorisée."));
        classroomRepository.delete(classroom);
    }

    @Override
    public void toggleStatus(Long id, Long schoolId) {
        Classroom classroom = classroomRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new RuntimeException("Classe introuvable ou accès refusé."));
        classroom.setActive(!classroom.isActive());
        classroomRepository.save(classroom);
    }
}