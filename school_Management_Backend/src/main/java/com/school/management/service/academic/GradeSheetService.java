package com.school.management.service.academic;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;
import com.school.management.dto.academic.PendingGradeSheetDTO;
import com.school.management.dto.academic.VisaStatusResponseDTO;
import com.school.management.model.enums.VisaStatus;

import java.util.List;

public interface GradeSheetService {
    GradeSheetResponseDTO generateStudentGradeSheet(Long studentId, Long academicYearId, int semester);

    ClassGradeSheetResponseDTO generateClassGradeSheet(Long teacherAssignmentId);

    void submitPeriodGradeSheetForVisa(Long teacherAssignmentId, int period);
    VisaStatusResponseDTO getPeriodGradeSheetVisaStatus(Long teacherAssignmentId, int period);

    List<PendingGradeSheetDTO> getPendingGradeSheetsForProviseur(Long academicYearId);

    // --- NOUVEAU : Actions du Proviseur ---
    void validatePeriodGradeSheet(Long teacherAssignmentId, int period);
    void rejectPeriodGradeSheet(Long teacherAssignmentId, int period, String comment);
}