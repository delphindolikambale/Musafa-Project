package com.school.management.service.academicImpl;

import com.school.management.dto.academic.DashboardDTO;
import com.school.management.repository.academic.ClassroomRepository;
import com.school.management.repository.academic.StudentRepository;
import com.school.management.repository.academic.TeacherRepository;
import com.school.management.service.academic.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Injection automatique via Lombok
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    @Override
    public DashboardDTO getGlobalStatistics() {
        return DashboardDTO.builder()
                .totalStudents(studentRepository.count())
                .totalTeachers(48) // Valeur temporaire car TeacherRepo n'existe pas
                .totalClasses(classroomRepository.count())
                .recoveryRate(85.0)
                .build();
    }
}
