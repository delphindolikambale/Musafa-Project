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
import org.springframework.stereotype.Service;

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

    @Override
    public StudentAcademicHistory create(StudentAcademicHistoryDTO dto) {

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student not found with ID: " + dto.getStudentId()));

        AcademicYear year = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "AcademicYear not found with ID: " + dto.getAcademicYearId()));

        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Classroom not found with ID: " + dto.getClassroomId()));

        StudentAcademicHistory history = StudentAcademicHistory.builder()
                .student(student)
                .academicYear(year)
                .classroom(classroom)
                .academicStatus(dto.getStatus()) // ⭐ LA LIGNE MANQUANTE
                .observation(dto.getObservation())
                .build();

        return historyRepository.save(history);
    }

}
