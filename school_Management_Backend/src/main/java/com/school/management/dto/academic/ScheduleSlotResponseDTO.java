package com.school.management.dto.academic;

import com.school.management.model.enums.DayOfWeek;
import lombok.Data;

@Data
public class ScheduleSlotResponseDTO {
    private Long id;
    private Long schoolId;
    private DayOfWeek dayOfWeek;
    private Long hourSlotId;        // Envoyé pour identifier le lien exact
    private Integer hourSlot;       // Représente le slotNumber (Ex: 1)
    private String hourSlotLabel;   // Libellé dynamique (Ex: "08h00 - 09h50")
    private Long classroomId;
    private String classroomName;
    private Long subjectId;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private String teacherMatricule;
}