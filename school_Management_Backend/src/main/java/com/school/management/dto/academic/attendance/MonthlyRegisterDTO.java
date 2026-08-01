package com.school.management.dto.academic.attendance;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class MonthlyRegisterDTO {
    private String schoolName;
    private String classroomName;
    private String titulaireName;
    private String academicYearName;
    private String monthName;
    private int monthValue;
    private int year;
    private int totalClassDays; // Nombre total de jours de classe effectués dans le mois (N)
    private List<StudentMonthlyRowDTO> studentRows;

    // Totaux bas de page
    private Map<Integer, Integer> dailyTotalPresences;
    private Map<Integer, Integer> dailyTotalAbsences;
}