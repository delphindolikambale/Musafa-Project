package com.school.management.dto.academic.attendance;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class StudentMonthlyRowDTO {
    private Long studentId;
    private String matricule;
    private String fullName;
    private String gender;
    // Map jour du mois (1 à 31) -> Symbole "|", "-", "+", "m", "p"
    private Map<Integer, String> dailySymbols;
    private int monthlyPresences;
    private int monthlyAbsences;
    private int cumulatedPresences;
    private double attendancePercentage;
}