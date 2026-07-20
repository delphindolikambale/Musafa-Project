package com.school.management.dto.academic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherAssignmentResponseDTO {
    private Long id;
    private Long teacherId;
    private String teacherFullName;
    private String teacherMatricule; // ✅ AJOUT : Requis pour afficher le matricule à côté du cours sur le frontend
    private Long courseAssignmentId;
    private Long subjectId; // ✅ AJOUT : Indispensable pour la récupération de l'ID côté frontend dans le ScheduleFormModal
    private String subjectName;
    private Long classroomId;
    private String classroomName; // ex: 4ème Technique A
    private double weeklyHours;
    private boolean isClassMaster;
    private String academicYear;
}