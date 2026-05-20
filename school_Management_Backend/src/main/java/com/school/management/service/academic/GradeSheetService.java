package com.school.management.service.academic;

import com.school.management.dto.academic.ClassGradeSheetResponseDTO;
import com.school.management.dto.academic.GradeSheetResponseDTO;

public interface GradeSheetService {
    GradeSheetResponseDTO generateStudentGradeSheet(Long studentId, Long academicYearId, int semester);

    // Nouvelle méthode pour générer la Matrice complète d'une classe pour un cours donné
    ClassGradeSheetResponseDTO generateClassGradeSheet(Long teacherAssignmentId);
}
