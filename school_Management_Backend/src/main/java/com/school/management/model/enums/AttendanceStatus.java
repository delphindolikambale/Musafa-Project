package com.school.management.model.enums;

import lombok.Getter;

@Getter
public enum AttendanceStatus {
    PRESENT("|", "Présent"),
    ABSENT("-", "Absent"),
    LATE("+", "Présent avec retard"),
    SICK("m", "Malade"),
    EXCUSED("p", "Absent valable");

    private final String symbol;
    private final String label;

    AttendanceStatus(String symbol, String label) {
        this.symbol = symbol;
        this.label = label;
    }
}