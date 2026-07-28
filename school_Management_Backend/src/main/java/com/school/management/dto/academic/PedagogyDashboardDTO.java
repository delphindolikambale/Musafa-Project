package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PedagogyDashboardDTO {

    // --- LES 5 CARTES INDICATEURS ---
    private long totalTeachers;
    private long totalMaleTeachers;
    private long totalFemaleTeachers;

    private long totalActiveClasses;
    private long totalRegisteredCourses;
    private long totalAssignedCourses;
    private long totalGradeSheetsReceived;

    // --- DERNIERS ENSEIGNANTS ENREGISTRÉS ---
    private List<RecentTeacherDTO> recentTeachers;
}