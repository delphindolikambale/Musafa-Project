package com.school.management.service.academic;
import com.school.management.dto.academic.ClassroomDTO;
import com.school.management.dto.academic.ClassroomRequestDTO;
import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.model.academic.Classroom;

import java.util.List;


public interface ClassroomService {

    ClassroomResponseDTO updateClassroom(Long id, ClassroomRequestDTO request);
    ClassroomResponseDTO create(ClassroomRequestDTO request);

    // Signatures supportant le filtrage par année pour les compteurs d'élèves
    List<ClassroomResponseDTO> getAll(Long academicYearId);
    List<ClassroomResponseDTO> getAllActive(Long academicYearId);
    ClassroomResponseDTO getById(Long id, Long academicYearId);
    List<ClassroomResponseDTO> getByLevel(Long levelId, Long academicYearId);

    // Méthodes de base (sans année, elles utiliseront l'année active par défaut)
    List<ClassroomResponseDTO> getAll();
    List<ClassroomResponseDTO> getAllActive();
    ClassroomResponseDTO getById(Long id);
    List<ClassroomResponseDTO> getByLevel(Long levelId);

    void delete(Long id);
    void toggleStatus(Long id);
}
