package com.school.management.service.academic;

import com.school.management.dto.academic.TeacherCreateDTO;
import com.school.management.dto.academic.TeacherResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TeacherService {
    TeacherResponseDTO createTeacher(TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs);
    List<TeacherResponseDTO> getAllTeachers();
    List<TeacherResponseDTO> getActiveTeachers(); // Nouvelle méthode
    List<TeacherResponseDTO> searchTeachers(String query);
    TeacherResponseDTO getTeacherByRegistrationNumber(String regNumber);
    TeacherResponseDTO getTeacherById(Long id);
    TeacherResponseDTO updateTeacher(Long id, TeacherCreateDTO dto, MultipartFile photo, MultipartFile cv, List<MultipartFile> titleDocs, List<MultipartFile> trainingDocs);
    TeacherResponseDTO toggleActiveStatus(Long id); // Nouvelle méthode
    void deleteTeacher(Long id);
}
