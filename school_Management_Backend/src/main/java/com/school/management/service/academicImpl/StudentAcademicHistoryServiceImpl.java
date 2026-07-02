package com.school.management.service.academicImpl;

import com.school.management.dto.academic.StudentAcademicHistoryDTO;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.academic.AcademicYear;
import com.school.management.model.academic.Classroom;
import com.school.management.model.academic.Student;
import com.school.management.model.academic.StudentAcademicHistory;
import com.school.management.repository.academic.AcademicYearRepository;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.StudentAcademicHistoryRepository;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.service.academic.StudentAcademicHistoryService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentAcademicHistoryServiceImpl implements StudentAcademicHistoryService {
    private final StudentAcademicHistoryRepository historyRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ClassroomRepository classroomRepository;

    public StudentAcademicHistoryServiceImpl(
            StudentAcademicHistoryRepository historyRepository,
            StudentRepository studentRepository,
            AcademicYearRepository academicYearRepository,
            ClassroomRepository classroomRepository) {

        this.historyRepository = historyRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.classroomRepository = classroomRepository;
    }

    /**
     * ✅ EXTRACTION DU CONTEXTE MULTI-TENANT SECURISE
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session utilisateur invalide ou expirée. Veuillez vous reconnecter.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("Action impossible : Votre compte utilisateur n'est rattaché à aucune école.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public StudentAcademicHistory create(StudentAcademicHistoryDTO dto) {
        Long currentSchoolId = getCurrentSchoolId();

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with ID: " + dto.getStudentId()));

        // ✅ VERIFICATION DE SÉCURITÉ MULTI-TENANT
        if (!student.getSchool().getId().equals(currentSchoolId)) {
            throw new AccessDeniedException("❌ Action interdite : Cet élève n'appartient pas à votre établissement.");
        }

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "AcademicYear not found with ID: " + dto.getAcademicYearId()));

        // ✅ VERIFICATION DE SÉCURITÉ MULTI-TENANT
        if (!year.getSchool().getId().equals(currentSchoolId)) {
            throw new AccessDeniedException("❌ Action interdite : L'année académique sélectionnée n'appartient pas à votre établissement.");
        }

        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Classroom not found with ID: " + dto.getClassroomId()));

        // ✅ VERIFICATION DE SÉCURITÉ MULTI-TENANT
        if (!classroom.getSchool().getId().equals(currentSchoolId)) {
            throw new AccessDeniedException("❌ Action interdite : La classe sélectionnée n'appartient pas à votre établissement.");
        }

        StudentAcademicHistory history = StudentAcademicHistory.builder()
                .student(student)
                .academicYear(year)
                .classroom(classroom)
                .academicStatus(dto.getStatus()) // ⭐ LA LIGNE MANQUANTE MAINTENUE
                .observation(dto.getObservation())
                .school(getCurrentUser().getSchool()) // ✅ MULTI-TENANT : Injection automatique de l'école courante
                .build();

        return historyRepository.save(history);
    }
}