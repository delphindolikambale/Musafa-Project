package com.school.management.service.academic;

import com.school.management.dto.academic.ClassroomResponseDTO;
import com.school.management.dto.academic.TitulaireMonitoringResponseDTO;

import java.util.List;

public interface TitulaireService {
    // 1. Permet à l'enseignant de savoir de quelles classes il est titulaire
    List<ClassroomResponseDTO> getMyClassrooms(Long teacherId, Long academicYearId);

    // 2. Permet au titulaire de voir l'état d'avancement des cotes pour une période précise
    TitulaireMonitoringResponseDTO getMonitoringForClassroomAndPeriod(Long classroomId, int period, Long academicYearId);
}