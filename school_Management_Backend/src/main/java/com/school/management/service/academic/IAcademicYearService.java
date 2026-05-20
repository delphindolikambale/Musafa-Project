package com.school.management.service.academic;

import com.school.management.dto.academic.AcademicYearDto;
import com.school.management.model.academic.AcademicYear;

import java.util.List;

public interface IAcademicYearService {

    AcademicYear save(AcademicYearDto dto);
    List<AcademicYear> getAll();
    void activateYear(Long id);
}
