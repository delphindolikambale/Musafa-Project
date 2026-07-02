package com.school.management.service.academic;

import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.model.multitenant.School;

import java.util.List;

public interface ClassroomService {

    // ✅ Adapté : Remplacement de School par Long schoolId pour s'aligner sur le contrôleur et les autres méthodes
    ClassroomResponseDTO create(ClassroomRequestDTO request, Long schoolId);

    ClassroomResponseDTO updateClassroom(Long id, ClassroomRequestDTO request, Long schoolId);

    List<ClassroomResponseDTO> getAll(Long academicYearId, Long schoolId);
    List<ClassroomResponseDTO> getAllActive(Long academicYearId, Long schoolId);
    ClassroomResponseDTO getById(Long id, Long academicYearId, Long schoolId);
    List<ClassroomResponseDTO> getByLevel(Long levelId, Long academicYearId, Long schoolId);

    List<ClassroomResponseDTO> getAll(Long schoolId);
    List<ClassroomResponseDTO> getAllActive(Long schoolId);
    ClassroomResponseDTO getById(Long id, Long schoolId);
    List<ClassroomResponseDTO> getByLevel(Long levelId, Long schoolId);

    void delete(Long id, Long schoolId);
    void toggleStatus(Long id, Long schoolId);

    void assignTitulaire(Long classroomId, Long teacherId, Long schoolId);
    void removeTitulaire(Long classroomId, Long schoolId);
}