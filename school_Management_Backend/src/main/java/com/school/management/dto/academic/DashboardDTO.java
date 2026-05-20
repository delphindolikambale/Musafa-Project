package com.school.management.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class DashboardDTO {

    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private double recoveryRate;
}
