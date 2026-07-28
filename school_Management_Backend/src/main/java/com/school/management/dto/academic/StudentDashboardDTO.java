package com.school.management.dto.academic;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDTO {

    // --- CARTES STATISTIQUES EN-TÊTE ---
    private long totalCourses;             // Total des cours suivis
    private double attendanceRate;         // Taux de présence du semestre (%)
    private long pendingAssignmentsCount;   // TP / Devoirs en attente de remise

    // --- HORAIRE DU JOUR ---
    private List<TodayScheduleDTO> todaySchedule;

    // --- RÉSULTATS RÉCENTS ---
    private List<RecentResultDTO> recentResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayScheduleDTO {
        private Long slotId;
        private String timeSlot;     // Ex: "08h00 - 08h50" ou "08:00"
        private String subjectName;  // Ex: "MATHÉMATIQUES"
        private String roomName;     // Ex: "Local 102"
        private String teacherName;  // Ex: "Prof. Kasereka"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentResultDTO {
        private Long markId;
        private String subjectName;  // Ex: "INFORMATIQUE DE GESTION"
        private String periodLabel;  // Ex: "PÉRIODE 1"
        private String scoreDisplay; // Ex: "18/20"
        private String status;       // Ex: "RÉUSSI" ou "ÉCHOUÉ"
        private boolean passed;
    }
}