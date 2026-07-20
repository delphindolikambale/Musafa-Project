package com.school.management.dto.academic.bulletin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentBulletinRowDTO {
    private Long studentId;
    private String fullName;
    private String gender;
    private String permanentNumber;
    private Long bulletinId;
    private String status; // Ex: "INITIALIZED", "VALIDATED"
}