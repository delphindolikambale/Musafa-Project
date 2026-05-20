package com.school.management.service.academic;


import com.school.management.dto.academic.StudentAcademicHistoryDTO;
import com.school.management.model.academic.StudentAcademicHistory;

public interface StudentAcademicHistoryService {
    StudentAcademicHistory create(StudentAcademicHistoryDTO dto);
}
