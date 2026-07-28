package com.school.management.dto.academic.bulletin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentBulletinRowDTO {

    private Long studentId;
    private String fullName;
    private String gender;
    private String permanentNumber;
    private Long bulletinId;
    private String status;
}